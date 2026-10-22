/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EBook {
  _id: string;
  title: string;
  image?: string;
  price?: number;
  isFree?: boolean;
  sequence?: number;
  subject?: string;
  language?: string;
  category?: string;
}

export interface Chapter {
  _id: string;
  title: string;
  sequence: number;
  bookId?: string;
  // Resolved elements
  pdfLoading?: boolean;
  pdfUrl?: string;
  pdfFetched?: boolean;
}

export interface PDFInfo {
  s3Key: string;
  pdfUrl: string;
}
