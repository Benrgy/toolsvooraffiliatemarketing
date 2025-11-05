/**
 * SEO Analyzer Utility
 * Analyzeert content op basis van Yoast SEO / Rank Math principes
 */

export interface SEOAnalysisResult {
  score: number; // 0-100
  issues: SEOIssue[];
  recommendations: string[];
  readabilityScore: number;
  wordCount: number;
  keywordDensity: number;
  internalLinks: number;
  externalLinks: number;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'success';
  message: string;
  field: string;
}

export const analyzeSEO = (data: {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug: string;
  featuredImageAlt?: string;
}): SEOAnalysisResult => {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Word count analysis
  const wordCount = data.content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 300) {
    issues.push({
      type: 'error',
      message: `Content te kort (${wordCount} woorden). Minimaal 300 woorden aanbevolen.`,
      field: 'content'
    });
    score -= 20;
  } else if (wordCount < 600) {
    issues.push({
      type: 'warning',
      message: `Content kan langer (${wordCount} woorden). 600-1500 woorden is ideaal.`,
      field: 'content'
    });
    score -= 5;
  }

  // Title analysis
  if (!data.title || data.title.length < 30) {
    issues.push({
      type: 'error',
      message: 'Titel te kort. Gebruik 30-60 karakters.',
      field: 'title'
    });
    score -= 10;
  } else if (data.title.length > 60) {
    issues.push({
      type: 'warning',
      message: 'Titel te lang. Google toont alleen de eerste 60 karakters.',
      field: 'title'
    });
    score -= 5;
  }

  // Meta title analysis
  if (!data.metaTitle) {
    issues.push({
      type: 'warning',
      message: 'Meta titel ontbreekt. Dit is belangrijk voor SEO.',
      field: 'metaTitle'
    });
    score -= 10;
  } else if (data.metaTitle.length > 60) {
    issues.push({
      type: 'error',
      message: 'Meta titel te lang (max 60 karakters).',
      field: 'metaTitle'
    });
    score -= 10;
  }

  // Meta description analysis
  if (!data.metaDescription) {
    issues.push({
      type: 'warning',
      message: 'Meta beschrijving ontbreekt.',
      field: 'metaDescription'
    });
    score -= 10;
  } else if (data.metaDescription.length < 120) {
    issues.push({
      type: 'warning',
      message: 'Meta beschrijving te kort. Gebruik 120-160 karakters.',
      field: 'metaDescription'
    });
    score -= 5;
  } else if (data.metaDescription.length > 160) {
    issues.push({
      type: 'error',
      message: 'Meta beschrijving te lang (max 160 karakters).',
      field: 'metaDescription'
    });
    score -= 10;
  }

  // Focus keyword analysis
  let keywordDensity = 0;
  if (data.focusKeyword) {
    const keyword = data.focusKeyword.toLowerCase();
    const contentLower = data.content.toLowerCase();
    const keywordCount = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
    keywordDensity = (keywordCount / wordCount) * 100;

    // Check keyword in title
    if (!data.title.toLowerCase().includes(keyword)) {
      issues.push({
        type: 'error',
        message: 'Focus keyword niet gevonden in titel.',
        field: 'title'
      });
      score -= 10;
    }

    // Check keyword in meta description
    if (data.metaDescription && !data.metaDescription.toLowerCase().includes(keyword)) {
      issues.push({
        type: 'warning',
        message: 'Focus keyword niet gevonden in meta beschrijving.',
        field: 'metaDescription'
      });
      score -= 5;
    }

    // Check keyword in slug
    if (!data.slug.includes(keyword.replace(/\s+/g, '-'))) {
      issues.push({
        type: 'warning',
        message: 'Focus keyword niet gevonden in URL slug.',
        field: 'slug'
      });
      score -= 5;
    }

    // Check keyword density
    if (keywordDensity < 0.5) {
      issues.push({
        type: 'warning',
        message: `Keyword density te laag (${keywordDensity.toFixed(2)}%). Streef naar 0.5-2.5%.`,
        field: 'content'
      });
      score -= 5;
    } else if (keywordDensity > 2.5) {
      issues.push({
        type: 'error',
        message: `Keyword density te hoog (${keywordDensity.toFixed(2)}%). Risico op keyword stuffing!`,
        field: 'content'
      });
      score -= 15;
    }

    // Check keyword in first paragraph
    const firstParagraph = data.content.split('\n\n')[0];
    if (!firstParagraph.toLowerCase().includes(keyword)) {
      issues.push({
        type: 'warning',
        message: 'Focus keyword niet in eerste paragraaf gevonden.',
        field: 'content'
      });
      score -= 5;
    }
  } else {
    issues.push({
      type: 'warning',
      message: 'Geen focus keyword ingesteld.',
      field: 'focusKeyword'
    });
    score -= 10;
  }

  // Image alt text analysis
  if (!data.featuredImageAlt) {
    issues.push({
      type: 'warning',
      message: 'Featured image alt tekst ontbreekt.',
      field: 'featuredImageAlt'
    });
    score -= 5;
  } else if (data.focusKeyword && !data.featuredImageAlt.toLowerCase().includes(data.focusKeyword.toLowerCase())) {
    issues.push({
      type: 'warning',
      message: 'Focus keyword niet in alt tekst.',
      field: 'featuredImageAlt'
    });
    score -= 3;
  }

  // Headings analysis
  const h1Count = (data.content.match(/^#\s/gm) || []).length;
  const h2Count = (data.content.match(/^##\s/gm) || []).length;
  
  if (h1Count === 0) {
    issues.push({
      type: 'error',
      message: 'Geen H1 heading gevonden in content.',
      field: 'content'
    });
    score -= 10;
  } else if (h1Count > 1) {
    issues.push({
      type: 'warning',
      message: 'Meerdere H1 headings gevonden. Gebruik slechts één H1.',
      field: 'content'
    });
    score -= 5;
  }

  if (h2Count === 0) {
    issues.push({
      type: 'warning',
      message: 'Geen H2 headings gevonden. Structureer je content met subkoppen.',
      field: 'content'
    });
    score -= 5;
  }

  // Links analysis
  const internalLinks = (data.content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  const externalLinks = (data.content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;

  if (internalLinks === 0) {
    issues.push({
      type: 'warning',
      message: 'Geen interne links gevonden. Voeg links naar gerelateerde content toe.',
      field: 'content'
    });
    score -= 5;
  }

  if (externalLinks === 0) {
    issues.push({
      type: 'warning',
      message: 'Geen externe links gevonden. Link naar betrouwbare bronnen.',
      field: 'content'
    });
    score -= 3;
  }

  // Readability score (simplified Flesch Reading Ease)
  const sentences = data.content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = wordCount;
  const syllables = estimateSyllables(data.content);
  
  let readabilityScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  readabilityScore = Math.max(0, Math.min(100, readabilityScore));

  if (readabilityScore < 60) {
    issues.push({
      type: 'warning',
      message: 'Content is moeilijk te lezen. Gebruik kortere zinnen.',
      field: 'content'
    });
    score -= 5;
  }

  // Recommendations
  const recommendations: string[] = [];
  if (score < 70) {
    recommendations.push('Los de gemarkeerde problemen op om je SEO score te verhogen.');
  }
  if (wordCount < 1000) {
    recommendations.push('Overweeg om je content uit te breiden naar 1000+ woorden voor betere rankings.');
  }
  if (internalLinks < 3) {
    recommendations.push('Voeg meer interne links toe naar gerelateerde posts en tools.');
  }
  if (!data.focusKeyword) {
    recommendations.push('Stel een focus keyword in om je SEO te optimaliseren.');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    issues,
    recommendations,
    readabilityScore: Math.round(readabilityScore),
    wordCount,
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    internalLinks,
    externalLinks
  };
};

// Simplified syllable estimation
function estimateSyllables(text: string): number {
  const words = text.split(/\s+/);
  let syllableCount = 0;
  
  words.forEach(word => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) {
      syllableCount += 1;
    } else {
      const vowels = word.match(/[aeiouy]+/g);
      syllableCount += vowels ? vowels.length : 1;
    }
  });
  
  return syllableCount;
}
