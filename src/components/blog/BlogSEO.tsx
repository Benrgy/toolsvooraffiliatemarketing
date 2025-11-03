import { Helmet } from "react-helmet-async";

interface BlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  featured_image_alt?: string;
  category?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
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
  
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": post.featured_image || "",
    "url": canonicalUrl,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Organization",
      "name": "BeginnenMetAffiliate.nl",
      "url": baseUrl
    },
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
    }
  };

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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content="BeginnenMetAffiliate.nl" />
      <meta property="og:locale" content="nl_NL" />
      {post.featured_image && <meta property="og:image" content={post.featured_image} />}
      {post.featured_image_alt && <meta property="og:image:alt" content={post.featured_image_alt} />}

      {/* Article Meta */}
      <meta property="article:published_time" content={post.published_at || post.created_at} />
      <meta property="article:modified_time" content={post.updated_at} />
      {post.category && <meta property="article:section" content={post.category} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}

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
    </Helmet>
  );
};
