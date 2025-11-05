import { Helmet } from "react-helmet-async";

interface BlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  featured_image?: string;
  featured_image_alt?: string;
  featured_image_width?: number;
  featured_image_height?: number;
  featured_image_caption?: string;
  category?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  schema_type?: string;
  article_tags?: string[];
  geo_target_country?: string;
  geo_target_language?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  video_url?: string;
  video_thumbnail_url?: string;
  video_duration?: string;
  video_description?: string;
  video_upload_date?: string;
  twitter_card_type?: string;
  review_rating?: number;
  review_count?: number;
  last_reviewed_at?: string;
  fact_checked?: boolean;
  expert_reviewed?: boolean;
  word_count?: number;
  readability_score?: number;
  display_author?: {
    name: string;
    bio?: string;
    avatar_url?: string;
    expertise_areas?: string[];
    credentials?: string;
    years_experience?: number;
    website_url?: string;
    twitter_handle?: string;
    linkedin_url?: string;
  };
}

interface BlogSEOProps {
  post: BlogPost;
  baseUrl?: string;
}

const generateFAQSchema = (content: string) => {
  const faqRegex = /###\s+\d+\.\s+\*\*(.*?)\*\*\n(.*?)(?=\n###\s+\d+\.|$)/gs;
  const faqs = [];
  let match;

  while ((match = faqRegex.exec(content)) !== null) {
    const question = match[1].trim();
    let answerText = match[2].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    if (question && answerText && question.includes('?')) {
      faqs.push({
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answerText.substring(0, 500)
        }
      });
    }
  }

  return faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs
  } : null;
};

export const BlogSEO = ({ post, baseUrl = "https://beginnenmetaffiliate.nl" }: BlogSEOProps) => {
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
  const pageTitle = post.meta_title || `${post.title} - Bewezen Strategie 2025`;
  const pageDescription = post.meta_description || post.excerpt || `De geheime ${post.title.toLowerCase()} strategie die 1000+ affiliate marketers nu gebruiken. Bewezen resultaten, zelfs voor beginners.`;
  
  // Enhanced image schema with dimensions
  const imageObject = post.featured_image ? {
    "@type": "ImageObject",
    "url": post.featured_image,
    "width": post.featured_image_width || 1200,
    "height": post.featured_image_height || 630,
    "caption": post.featured_image_caption || post.featured_image_alt || post.title,
    "contentUrl": post.featured_image
  } : undefined;

  // Author schema with E-E-A-T signals
  const authorSchema = post.display_author ? {
    "@type": "Person",
    "name": post.display_author.name,
    "description": post.display_author.bio,
    "image": post.display_author.avatar_url,
    "url": post.display_author.website_url || baseUrl,
    "sameAs": [
      post.display_author.linkedin_url,
      post.display_author.twitter_handle ? `https://twitter.com/${post.display_author.twitter_handle}` : null,
    ].filter(Boolean),
    "jobTitle": post.display_author.credentials,
    "knowsAbout": post.display_author.expertise_areas || [],
  } : {
    "@type": "Organization",
    "name": "BeginnenMetAffiliate.nl",
    "url": baseUrl
  };

  // Advanced Blog Posting Schema with E-E-A-T
  const schemaType = post.schema_type || "BlogPosting";
  const blogPostSchema: any = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "headline": post.title,
    "description": post.excerpt || pageDescription,
    "image": imageObject,
    "url": canonicalUrl,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at,
    "author": authorSchema,
    "publisher": {
      "@type": "Organization",
      "name": "BeginnenMetAffiliate.nl",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "inLanguage": post.geo_target_language || "nl-NL",
    "keywords": post.meta_keywords?.join(", ") || post.article_tags?.join(", "),
  };

  // Add E-E-A-T signals
  if (post.word_count) {
    blogPostSchema.wordCount = post.word_count;
  }

  if (post.review_rating && post.review_count) {
    blogPostSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": post.review_rating,
      "reviewCount": post.review_count,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  if (post.fact_checked) {
    blogPostSchema.isAccessibleForFree = true;
    blogPostSchema.isPartOf = {
      "@type": "CreativeWorkSeries",
      "name": "Fact-Checked Articles"
    };
  }

  // Video Schema (for video content)
  const videoSchema = post.video_url ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": post.title,
    "description": post.video_description || post.excerpt,
    "thumbnailUrl": post.video_thumbnail_url,
    "uploadDate": post.video_upload_date || post.published_at || post.created_at,
    "duration": post.video_duration,
    "contentUrl": post.video_url,
    "embedUrl": post.video_url,
    "publisher": {
      "@type": "Organization",
      "name": "BeginnenMetAffiliate.nl",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": canonicalUrl
      }
    ]
  };

  const faqSchema = post.content ? generateFAQSchema(post.content) : null;

  // Geo-targeting
  const geoLocale = post.geo_target_language || "nl_NL";
  const geoCountry = post.geo_target_country || "NL";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      {post.meta_keywords && post.meta_keywords.length > 0 && (
        <meta name="keywords" content={post.meta_keywords.join(", ")} />
      )}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Language and Geographic Targeting */}
      <meta httpEquiv="content-language" content={geoLocale} />
      <meta name="geo.region" content={geoCountry} />
      {post.geo_target_language && <link rel="alternate" hrefLang={post.geo_target_language} href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content="BeginnenMetAffiliate.nl" />
      <meta property="og:locale" content={geoLocale} />
      {post.featured_image && <meta property="og:image" content={post.featured_image} />}
      {post.featured_image_alt && <meta property="og:image:alt" content={post.featured_image_alt} />}
      {post.featured_image_width && <meta property="og:image:width" content={String(post.featured_image_width)} />}
      {post.featured_image_height && <meta property="og:image:height" content={String(post.featured_image_height)} />}

      {/* Article Meta with E-E-A-T */}
      <meta property="article:published_time" content={post.published_at || post.created_at} />
      <meta property="article:modified_time" content={post.updated_at} />
      {post.category && <meta property="article:section" content={post.category} />}
      {post.article_tags?.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {post.display_author && <meta property="article:author" content={post.display_author.name} />}
      {post.last_reviewed_at && <meta property="article:reviewed_time" content={post.last_reviewed_at} />}
      {post.fact_checked && <meta name="fact-checked" content="true" />}
      {post.expert_reviewed && <meta name="expert-reviewed" content="true" />}

      {/* Twitter */}
      <meta name="twitter:card" content={post.twitter_card_type || "summary_large_image"} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}
      {post.featured_image_alt && <meta name="twitter:image:alt" content={post.featured_image_alt} />}
      {post.display_author?.twitter_handle && (
        <meta name="twitter:creator" content={`@${post.display_author.twitter_handle}`} />
      )}

      {/* Pinterest */}
      {post.featured_image && <meta property="og:image:secure_url" content={post.featured_image} />}
      <meta name="pinterest-rich-pin" content="true" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(blogPostSchema)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {videoSchema && (
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      )}
    </Helmet>
  );
};
