/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Book, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  BookOpen, 
  RefreshCw, 
  Layers, 
  Tag, 
  HelpCircle,
  FileCheck2,
  Lock,
  Compass,
  Settings,
  Heart
} from "lucide-react";
import { EBook, Chapter } from "./types";

// Pinnacle Logo component replicating the uploaded trademark exactly
function PinnacleLogo() {
  return (
    <div className="flex items-center select-none" id="pinnacle-brand-logo-rendered">
      {/* PINN */}
      <span className="font-sans font-black text-xl sm:text-[23px] tracking-[0.03em] text-[#103ecf]">
        PINN
      </span>
      
      {/* Pyramid Cone substituting A */}
      <svg className="mx-0.5 h-[23px] sm:h-[26px] w-auto shrink-0" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Layer 1 (Bottom Base) */}
        <path d="M10 110 L90 110 L82 92 L18 92 Z" fill="#800000" />
        <path d="M50 110 L90 110 L82 92 L50 92 Z" fill="#b30000" />
        <line x1="10" y1="110" x2="90" y2="110" stroke="#fca5a5" strokeWidth="1.5" />
        
        {/* Layer 2 */}
        <path d="M19 90 L81 90 L73 72 L27 72 Z" fill="#990000" />
        <path d="M50 90 L81 90 L73 72 L50 72 Z" fill="#cc0000" />
        <line x1="19" y1="90" x2="81" y2="90" stroke="#fca5a5" strokeWidth="1" opacity="0.9" />
        
        {/* Layer 3 */}
        <path d="M28 70 L72 70 L65 52 L35 52 Z" fill="#b30000" />
        <path d="M50 70 L72 70 L65 52 L50 52 Z" fill="#e60000" />
        <line x1="28" y1="70" x2="72" y2="70" stroke="#fca5a5" strokeWidth="1" opacity="0.9" />
        
        {/* Layer 4 */}
        <path d="M37 50 L63 50 L56 32 L44 32 Z" fill="#cc0000" />
        <path d="M50 50 L63 50 L56 32 L50 32 Z" fill="#ff1a1a" />
        <line x1="37" y1="50" x2="63" y2="50" stroke="#fee2e2" strokeWidth="1" opacity="0.9" />
        
        {/* Layer 5 (Top Tip) */}
        <path d="M45 30 L55 30 L50 10 Z" fill="#e60000" />
        <path d="M50 30 L55 30 L50 10 Z" fill="#ff3333" />
        <line x1="45" y1="30" x2="55" y2="30" stroke="#ffffff" strokeWidth="1" opacity="0.95" />
      </svg>
      
      {/* CLE */}
      <span className="font-sans font-black text-xl sm:text-[23px] tracking-[0.03em] text-[#103ecf]">
        CLE
      </span>
    </div>
  );
}

export default function App() {
  const [books, setBooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // WhatsApp notification modal - active by default on every reload
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(true);

  // DevTools detection state
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // 1. Key combination block triggers
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        setIsDevToolsOpen(true);
        return;
      }
      // Ctrl+Shift+I, J, C or Cmd+Opt+I, J, C
      const isCmdOpt = e.metaKey && e.altKey;
      const isCtrlShift = e.ctrlKey && e.shiftKey;
      if ((isCtrlShift || isCmdOpt) && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        setIsDevToolsOpen(true);
        return;
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        setIsDevToolsOpen(true);
        return;
      }
    };

    // 2. Right click / Context Menu block trigger
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setIsDevToolsOpen(true);
    };

    // 3. Dimensional checks (For docked devtools)
    const checkDimensions = () => {
      // Avoid false positives when nested inside an iframe (like the AI Studio Preview panel or custom tabs)
      if (window.self !== window.top) return;

      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      // If DevTools is open and not on an iframe, one of these will exceed the threshold
      if (widthDiff > threshold || heightDiff > threshold) {
        setIsDevToolsOpen(true);
      }
    };

    // Attach listeners
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("resize", checkDimensions);

    // Run active timers/intervals
    const resizeInterval = setInterval(checkDimensions, 1000);

    // Initial check
    checkDimensions();

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("resize", checkDimensions);
      clearInterval(resizeInterval);
    };
  }, []);
  
  // Custom Pinnacle authorization token input
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem("pinnacle_auth_token") || "";
  });
  const [tokenInput, setTokenInput] = useState<string>(authToken);
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Chapter State
  const [selectedBook, setSelectedBook] = useState<EBook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Copy URL states
  const [copiedPDFId, setCopiedPDFId] = useState<string | null>(null);

  // Favorites states
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pinnacle_favorite_books");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Save favorites to localStorage when updated
  useEffect(() => {
    localStorage.setItem("pinnacle_favorite_books", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (bookId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  // Floating search button state & ref
  const [showFloatSearch, setShowFloatSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 140) {
        setShowFloatSearch(true);
      } else {
        setShowFloatSearch(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 250);
  };

  // Fetch eBooks on mount or token changes
  useEffect(() => {
    fetchBooks(authToken);
  }, [authToken]);

  const fetchBooks = async (tokenValue: string = authToken) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        "accept": "*/*"
      };
      if (tokenValue.trim()) {
        const trimmedToken = tokenValue.trim();
        headers["x-pinnacle-token"] = trimmedToken;
        headers["token"] = trimmedToken;
        headers["Token"] = trimmedToken;
        headers["authorization"] = trimmedToken.startsWith("Bearer ") ? trimmedToken : `Bearer ${trimmedToken}`;
      }
      const response = await fetch("/api/ebooks", { headers });
      if (!response.ok) {
        throw new Error("Failed to retrieve ebooks list from the Pinnacle server.");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        throw new Error("Invalid response format received.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToken = () => {
    const trimmed = tokenInput.trim();
    localStorage.setItem("pinnacle_auth_token", trimmed);
    setAuthToken(trimmed);
  };

  // Filter and Search logic
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.subject && book.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchSearch) return false;

      if (showOnlyFavorites) {
        return favorites.includes(book._id);
      }

      return true;
    });
  }, [books, searchQuery, showOnlyFavorites, favorites]);

  // Handle Book selection (Load Chapters)
  const handleOpenBook = async (book: EBook) => {
    setSelectedBook(book);
    setChapters([]);
    setChapterSearch("");
    setChaptersLoading(true);
    setChapterError(null);
    window.scrollTo(0, 0);

    try {
      const headers: Record<string, string> = {
        "accept": "*/*"
      };
      if (authToken.trim()) {
        const trimmedToken = authToken.trim();
        headers["x-pinnacle-token"] = trimmedToken;
        headers["token"] = trimmedToken;
        headers["Token"] = trimmedToken;
        headers["authorization"] = trimmedToken.startsWith("Bearer ") ? trimmedToken : `Bearer ${trimmedToken}`;
      }
      const response = await fetch(`/api/chapters/${book._id}`, { headers });
      if (!response.ok) {
        throw new Error("Failed to retrieve chapters for this book.");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        // Enforce sequence sorting client-side
        const sortedData = [...data].sort((a, b) => (a.sequence || 999) - (b.sequence || 999));
        const mappedChapters = sortedData.map((ch: any) => ({
          ...ch,
          pdfLoading: false,
          pdfUrl: undefined,
          pdfFetched: false
        }));
        setChapters(mappedChapters);
      } else {
        throw new Error("Invalid chapters format received.");
      }
    } catch (err: any) {
      setChapterError(err.message || "Unable to load book chapters.");
    } finally {
      setChaptersLoading(false);
    }
  };

  // Handle opening PDF directly on touch / tap instantly
  const handleOpenChapterPDF = async (chapterIndex: number, chapterId: string, currentUrl?: string) => {
    // If we already have the URL, just open it!
    if (currentUrl) {
      window.open(currentUrl, '_blank');
      return;
    }

    // Set loading state inside the card component itself
    setChapters(prev => prev.map((ch, idx) => {
      if (idx === chapterIndex) {
        return { ...ch, pdfLoading: true };
      }
      return ch;
    }));

    try {
      const headers: Record<string, string> = {
        "accept": "*/*"
      };
      if (authToken.trim()) {
        const trimmedToken = authToken.trim();
        headers["x-pinnacle-token"] = trimmedToken;
        headers["token"] = trimmedToken;
        headers["Token"] = trimmedToken;
        headers["authorization"] = trimmedToken.startsWith("Bearer ") ? trimmedToken : `Bearer ${trimmedToken}`;
      }
      const response = await fetch(`/api/pdf/${chapterId}`, { headers });
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      
      let resolvedPdfUrl = undefined;
      if (Array.isArray(data) && data.length > 0) {
        const s3Key = data[0].s3Key;
        if (s3Key) {
          resolvedPdfUrl = `https://dzdx39zg243ni.cloudfront.net/${s3Key}`;
        }
      } else if (data && typeof data === "object") {
        resolvedPdfUrl = data.pdfUrl || (data.s3Key ? `https://dzdx39zg243ni.cloudfront.net/${data.s3Key}` : undefined);
      }
      
      setChapters(prev => prev.map((ch, idx) => {
        if (idx === chapterIndex) {
          return { 
            ...ch, 
            pdfLoading: false, 
            pdfUrl: resolvedPdfUrl,
            pdfFetched: true 
          };
        }
        return ch;
      }));

      if (resolvedPdfUrl) {
        window.open(resolvedPdfUrl, '_blank');
      } else {
        alert("No PDF URL found associated with this chapter.");
      }
    } catch (err) {
      setChapters(prev => prev.map((ch, idx) => {
        if (idx === chapterIndex) {
          return { 
            ...ch, 
            pdfLoading: false, 
            pdfUrl: undefined,
            pdfFetched: true 
          };
        }
        return ch;
      }));
      alert("Failed to retrieve or open the PDF. Please verify your connection or token.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPDFId(id);
    setTimeout(() => {
      setCopiedPDFId(null);
    }, 2000);
  };

  // Filtered chapters inside details
  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return chapters;
    return chapters.filter(ch => 
      ch.title.toLowerCase().includes(chapterSearch.toLowerCase())
    );
  }, [chapters, chapterSearch]);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#070a13]/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PinnacleLogo />
          </div>

          {/* Interactive Favorites Toggle Button */}
          <button
            onClick={() => setShowOnlyFavorites(prev => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              showOnlyFavorites 
                ? "bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-md shadow-rose-950/40" 
                : "bg-[#111625] border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
            id="main-favorite-toggle-btn"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${showOnlyFavorites ? "fill-rose-500 text-rose-500 animate-pulse" : "text-rose-400"}`} />
            <span>My Fav {favorites.length > 0 && `(${favorites.length})`}</span>
          </button>
        </div>
      </header>

      {!selectedBook && (
        <>
          {/* SEARCH WORKSPACE */}
          <section className="bg-[#0b0f19] border-b border-slate-800/60 py-5" id="ebooks-search-bar-sticky">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type/search book name, subject name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#111625] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-[#151c2f] focus:outline-none text-xs sm:text-sm transition-all shadow-inner"
                  id="book-main-search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-slate-800 p-1 rounded-full text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6" id="ebooks-section">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center">
            <div className="inline-flex relative mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-900/30 animate-pulse"></div>
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin absolute top-3 left-3" />
            </div>
            <p className="text-slate-400 font-medium text-sm">Retrieving books database securely...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto my-12 bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 text-center shadow-xs">
            <div className="inline-flex p-3 bg-rose-950/40 rounded-full text-rose-400 mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-rose-200 text-lg mb-2">Failed to load Books Catalog</h3>
            <p className="text-rose-400 text-sm mb-6">{error}</p>
            <button 
              onClick={() => fetchBooks()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4 animate-spin-reverse mr-1" />
              <span>Retry Fetching</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="inline-flex p-4 bg-slate-900/40 rounded-2xl text-slate-500 mb-4 border border-slate-800/40">
              <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="font-display font-semibold text-white text-lg mb-1">
              {showOnlyFavorites ? "No Favorite Books Yet" : "No Books match criteria"}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              {showOnlyFavorites 
                ? "Touch the heart icon on any eBook card to save it here for fast access!"
                : "Try broadening your search query or switching filters."}
            </p>
            <button 
              onClick={() => {
                if (showOnlyFavorites) {
                  setShowOnlyFavorites(false);
                } else {
                  setSearchQuery("");
                }
              }}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
            >
              {showOnlyFavorites ? "Show All eBooks" : "Reset Search"}
            </button>
          </div>
        )}

        {/* EBOOKS GRID */}
        {!loading && !error && filteredBooks.length > 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredBooks.map((book) => {
                const isFree = book.price === 0 || book.isFree === true;
                const subjectName = book.subject || book.category || "General";
                
                return (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-[310px] sm:max-w-sm mx-auto flex flex-col bg-[#111625] border border-slate-800/80 rounded-xl shadow-lg hover:border-slate-700 transition-[#0.2s] overflow-hidden cursor-pointer text-left"
                    onClick={() => handleOpenBook(book)}
                  >
                    {/* Cover Photo - compact aspect ratio to avoid giant cards on mobile */}
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden group border-b border-slate-800/50">
                      {book.image ? (
                        <img 
                          src={book.image} 
                          alt={book.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-2 text-center bg-[#0d121f]">
                          <BookOpen className="w-8 h-8 mb-1 stroke-1 text-slate-600" />
                          <span className="text-[10px] font-medium">No Cover</span>
                        </div>
                      )}

                      {/* Floating corner Heart icon overlay button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(book._id, e)}
                        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-[#070a13]/70 hover:bg-[#070a13]/95 hover:scale-110 active:scale-95 border border-slate-800/60 backdrop-blur-xs shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center"
                        title={favorites.includes(book._id) ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 transition-colors duration-150 ${
                            favorites.includes(book._id)
                              ? "fill-rose-500 text-rose-500"
                              : "text-slate-400 hover:text-rose-400"
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Book Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title matching user's image spacing and font color */}
                        <h3 className="font-sans font-semibold text-white hover:text-indigo-400 text-[13px] sm:text-[14px] line-clamp-2 leading-snug min-h-[38px] transition-colors">
                          {book.title}
                        </h3>

                        {/* Price Display placed beautifully above the single Action Button */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Price:</span>
                          {isFree ? (
                            <span className="text-emerald-400 font-extrabold flex items-center">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                              FREE
                            </span>
                          ) : (
                            <span className="text-indigo-400 font-extrabold">
                              ₹{book.price ?? "Premium"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Single Action Button: Only Subject Button at the bottom */}
                      <div className="mt-4 pt-3 border-t border-slate-800/50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBook(book);
                          }}
                          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#1b253b] hover:bg-[#212d4a] active:scale-[0.98] text-slate-200 border border-slate-700/50 font-bold text-[12px] rounded-lg transition-all cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Subject</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
        </>
      )}

      {/* SUBJECT DETAILS PAGE CONTROLLER */}
      {selectedBook && (
        <motion.div
          key="subject-details-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 min-h-[calc(100vh-73px)]"
          id="subject-details-view"
        >
          {/* Back button */}
          <button 
            onClick={() => setSelectedBook(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors cursor-pointer group mb-6 bg-slate-900/60 hover:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-800/80 w-fit"
            id="back-to-library-btn"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-indigo-400" />
            <span className="text-xs sm:text-sm font-bold">← Back to Library / वापस जाएँ</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Book details */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#111625] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl p-5 space-y-5">
                {/* Book Cover */}
                <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-800/50">
                  {selectedBook.image ? (
                    <img 
                      src={selectedBook.image} 
                      alt={selectedBook.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-2 text-center bg-[#0d121f]">
                      <BookOpen className="w-12 h-12 mb-2 stroke-1 text-slate-600" />
                      <span className="text-xs font-medium">No Cover Available</span>
                    </div>
                  )}

                  {/* Favorite toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(selectedBook._id, e)}
                    className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-[#070a13]/85 hover:bg-[#070a13] hover:scale-110 active:scale-95 border border-slate-700/60 backdrop-blur-xs shadow-md transition-all cursor-pointer flex items-center justify-center"
                    title={favorites.includes(selectedBook._id) ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors duration-150 ${
                        favorites.includes(selectedBook._id)
                          ? "fill-rose-500 text-rose-500"
                          : "text-slate-400 hover:text-rose-400"
                      }`} 
                    />
                  </button>
                </div>

                {/* Subject Description fields */}
                <div className="space-y-4 text-left">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-900/50 uppercase tracking-widest">
                      {selectedBook.subject || selectedBook.category || "General"}
                    </span>
                    <h1 className="font-sans font-extrabold text-white text-base sm:text-xl mt-2 leading-snug">
                      {selectedBook.title}
                    </h1>
                  </div>

                  <div className="h-px bg-slate-800/60" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Access Type:</span>
                    {selectedBook.price === 0 || selectedBook.isFree === true ? (
                      <span className="text-emerald-400 font-extrabold flex items-center bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900/30">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                        FREE ACCESS
                      </span>
                    ) : (
                      <span className="text-indigo-405 font-extrabold bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-900/30 text-indigo-400">
                        Premium (₹{selectedBook.price})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chapters listing */}
            <div className="lg:col-span-8 bg-[#0d1222]/40 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">

              {/* Chapters Content List */}
              <div className="space-y-3.5 text-left">
                {chaptersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((idx) => (
                      <div key={idx} className="border border-slate-800/60 rounded-xl p-4 animate-pulse space-y-2 bg-[#11172a]">
                        <div className="h-4 bg-slate-800 rounded-sm w-3/4"></div>
                        <div className="h-3 bg-slate-900 rounded-sm w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : chapterError ? (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-xs text-rose-400 font-semibold">{chapterError}</p>
                    <button 
                      onClick={() => handleOpenBook(selectedBook)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : filteredChapters.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No chapters match your search query.</p>
                  </div>
                ) : (
                  filteredChapters.map((ch, idx) => (
                    <div 
                      key={ch._id}
                      onClick={() => {
                        if (ch.pdfLoading) return;
                        handleOpenChapterPDF(idx, ch._id, ch.pdfUrl);
                      }}
                      className="border border-[#15233c] hover:border-[#00a3cc]/50 rounded-2xl bg-[#090d1a] p-5 flex flex-col justify-between hover:bg-[#0c1224] transition-all cursor-pointer select-none active:scale-[0.99] relative overflow-hidden group"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* File Text Icon exactly matching the user's uploaded photo layout */}
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#081b29] border border-[#0d344d] shrink-0 group-hover:border-[#00a3cc]/50 transition-colors">
                          {ch.pdfLoading ? (
                            <RefreshCw className="w-5 h-5 text-[#00a3cc] animate-spin" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#00a3cc]" />
                          )}
                        </div>
                        
                        <div className="space-y-1 flex-1 text-left">
                          <h4 className="font-sans font-bold text-slate-100 text-[13px] sm:text-[14px] leading-snug tracking-wide group-hover:text-[#00a3cc] transition-colors">
                            {ch.title}
                          </h4>
                        </div>
                      </div>

                      {/* PDF Action Area */}
                      <div className="mt-4">
                        <div
                          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#141b2f] group-hover:bg-[#1a253e] border border-slate-700/60 group-hover:border-[#00a3cc]/40 text-slate-200 rounded-xl transition-all font-bold text-xs uppercase tracking-wider group-hover:text-white"
                        >
                          {ch.pdfLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 text-[#00a3cc] animate-spin mr-1.5" />
                              <span className="text-[#00a3cc]">LOADING NOTE...</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 text-[#00a3cc]" />
                              <span>OPEN NOTE</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* FLOATING SEARCH ACCESS ICON (ONLY SHOWN WHEN WORKSPACE SCROLLS AWAY AND NO SUBJECT IS SELECTED) */}
      <AnimatePresence>
        {showFloatSearch && !selectedBook && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={handleScrollToSearch}
            className="fixed bottom-6 right-6 z-40 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl border border-indigo-550 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
            id="floating-search-redirect-btn"
          >
            <Search className="w-[18px] h-[18px] text-white stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WHATSAPP GROUP INVITE POPUP TRIGGERED ON OVER ALL SITES REFRESH/OPEN */}
      <AnimatePresence>
        {showWhatsAppModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md"
            id="whatsapp-modal-container"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[420px] bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 flex flex-col items-center justify-center shadow-2xl select-none text-center"
              id="whatsapp-modal-card"
            >
              {/* Close Grayish Cross icon */}
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Centered Circular Green Whatsapp Layout */}
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#e8faf4] mb-8">
                <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#25d366] text-white shadow-xl shadow-emerald-500/10">
                  <svg className="w-10 h-10 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
              </div>

              {/* Bold Headline */}
              <h3 className="font-sans font-extrabold text-[25px] sm:text-[27px] text-[#0f172a] leading-tight mb-3 tracking-wide">
                Join Our WhatsApp!
              </h3>

              {/* Gray Description */}
              <p className="text-[#64748b] text-[13px] sm:text-[14px] leading-relaxed max-w-[310px] text-center mb-8 font-medium">
                Get the latest updates, exclusive content, and new links if our site gets blocked.
              </p>

              {/* Buttons Stack */}
              <div className="w-full flex flex-col space-y-3">
                {/* Join Channel Solid Green link */}
                <a
                  href="https://www.whatsapp.com/channel/0029VbCUE8230LKHYMCduo13"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="w-full py-3.5 px-6 bg-[#25d366] hover:bg-[#20ba59] active:scale-[0.98] text-white rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <svg className="w-[18px] h-[18px] fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Join Channel</span>
                </a>

                {/* Cancel soft button */}
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="w-full py-3.5 bg-[#f8fafc] hover:bg-[#f1f5f9] active:scale-[0.98] text-[#475569] hover:text-[#0f172a] font-bold text-sm sm:text-base rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEVTOOLS DETECTED OVERLAY */}
      {isDevToolsOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#070a13] flex flex-col items-center justify-center p-6 text-center select-none" id="devtools-blocked-view">
          {/* Ambient glowing background gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#103ecf]/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative max-w-lg w-full bg-[#0d1326]/60 border border-red-500/30 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 shadow-2xl shadow-red-950/20 flex flex-col items-center">
            {/* Warning Icon with pulse effect */}
            <div className="relative mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Stylish Headline to exact request */}
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-red-500 tracking-tight leading-tight mb-4">
              kyare gandu
            </h1>
            
            {/* Elegant text body */}
            <p className="font-sans font-semibold text-slate-300 text-lg sm:text-xl leading-relaxed max-w-sm">
              padhne k lie bnayi h tumjeso k lie nahi
            </p>
            
            {/* Bottom brand logo accent */}
            <div className="mt-10 opacity-40">
              <PinnacleLogo />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
