export interface GenerationConfig {
  wordCount: 500 | 750 | 1000 | 1250 | 1500;
  keywords: string[];
  includeFAQ: boolean;
}

export interface ContentGenerationResponse {
  content: string;
  wordCount: number;
  keywordsUsed: string[];
}

export interface ImageGenerationResponse {
  imageUrl: string;
  altText: string;
}

export interface SEOGenerationResponse {
  excerpt: string;
  altText: string;
  metaTitle: string;
  metaDescription: string;
}
