import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// CORS middleware for Netlify/external static deploys
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,x-pinnacle-token");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Simple in-memory cache to stay fast and respect external servers
const cache: { [key: string]: { data: any; expiry: number } } = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

function getCached(key: string) {
  const item = cache[key];
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  return null;
}

function setCached(key: string, data: any) {
  cache[key] = {
    data,
    expiry: Date.now() + CACHE_TTL,
  };
}

// Request Headers matching the browser style required by ssccglpinnacle
const PINNACLE_HEADERS = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9",
  "origin": "https://ebooks.ssccglpinnacle.com",
  "referer": "https://ebooks.ssccglpinnacle.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

// API Endpoints
app.get("/api/ebooks", async (req, res) => {
  const pinnacleToken = req.headers["x-pinnacle-token"] as string;
  const cacheKey = `ebooks_list_${pinnacleToken ? Buffer.from(pinnacleToken).toString('base64').substring(0, 16) : "public"}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const headers: Record<string, string> = { ...PINNACLE_HEADERS };
    if (pinnacleToken) {
      headers["token"] = pinnacleToken;
      headers["Token"] = pinnacleToken;
      headers["authorization"] = pinnacleToken.startsWith("Bearer ") ? pinnacleToken : `Bearer ${pinnacleToken}`;
    }

    const response = await fetch("https://auth.ssccglpinnacle.com/api/ebooksforactive?active=true", {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Pinnacle API returned status ${response.status}`);
    }
    const data = await response.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ error: "Failed to fetch ebooks from source server" });
  }
});

app.get("/api/chapters/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const pinnacleToken = req.headers["x-pinnacle-token"] as string;
  const cacheKey = `chapters_${bookId}_${pinnacleToken ? Buffer.from(pinnacleToken).toString('base64').substring(0, 16) : "public"}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const headers: Record<string, string> = { ...PINNACLE_HEADERS };
    if (pinnacleToken) {
      headers["token"] = pinnacleToken;
      headers["Token"] = pinnacleToken;
      headers["authorization"] = pinnacleToken.startsWith("Bearer ") ? pinnacleToken : `Bearer ${pinnacleToken}`;
    }

    const response = await fetch(`https://sujalpinnacletesting.vercel.app/api/chapters/${bookId}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Chapters API returned status ${response.status}`);
    }
    const data = await response.json();
    
    // Sort chapters by sequence if possible
    let sortedData = data;
    if (Array.isArray(data)) {
      sortedData = [...data].sort((a, b) => (a.sequence || 999) - (b.sequence || 999));
    }
    
    setCached(cacheKey, sortedData);
    res.json(sortedData);
  } catch (error: any) {
    console.error(`Error fetching chapters for book ${bookId}:`, error.message);
    res.status(500).json({ error: `Failed to fetch chapters for book ${bookId}` });
  }
});

app.get("/api/pdf/:chapterId", async (req, res) => {
  const { chapterId } = req.params;
  const pinnacleToken = req.headers["x-pinnacle-token"] as string;
  const cacheKey = `pdf_${chapterId}_${pinnacleToken ? Buffer.from(pinnacleToken).toString('base64').substring(0, 16) : "public"}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const headers: Record<string, string> = { ...PINNACLE_HEADERS };
    if (pinnacleToken) {
      headers["token"] = pinnacleToken;
      headers["Token"] = pinnacleToken;
      headers["authorization"] = pinnacleToken.startsWith("Bearer ") ? pinnacleToken : `Bearer ${pinnacleToken}`;
    }

    const response = await fetch(`https://auth.ssccglpinnacle.com/api/pdfs-ebook/${chapterId}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`PDF API returned status ${response.status}`);
    }
    const data = await response.json();
    
    let result = null;
    if (Array.isArray(data) && data.length > 0) {
      const s3Key = data[0].s3Key;
      if (s3Key) {
        result = {
          s3Key,
          pdfUrl: `https://dzdx39zg243ni.cloudfront.net/${s3Key}`
        };
      }
    }
    
    if (result) {
      setCached(cacheKey, result);
    }
    res.json(result);
  } catch (error: any) {
    console.error(`Error fetching PDF for chapter ${chapterId}:`, error.message);
    res.status(500).json({ error: `Failed to fetch PDF info for chapter ${chapterId}` });
  }
});

// Configure Vite middleware and static asset serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pinnacle Ebook App server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite startup error:", err);
});
