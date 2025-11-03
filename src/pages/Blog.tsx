import { Layout } from "@/components/Layout";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogHero } from "@/components/blog/BlogHero";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  return (
    <Layout>
      <Helmet>
        <title>De Geheimen Die Topverdieners Niet Delen Over AI</title>
        <meta name="title" content="De Geheimen Die Topverdieners Niet Delen Over AI" />
        <meta
          name="description"
          content="Wat niemand je vertelt over affiliate marketing succes met AI - bewezen strategieën van €10K+ per maand verdieners. Zelfs als je vandaag begint."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/blog" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://beginnenmetaffiliate.nl/blog" />
        <meta property="og:title" content="De Geheimen Die Topverdieners Niet Delen Over AI" />
        <meta
          property="og:description"
          content="Join 10.000+ lezers die nu €3.000+ per maand verdienen - bewezen AI strategieën"
        />
        <meta property="og:site_name" content="BeginnenMetAffiliate.nl" />
        <meta property="og:locale" content="nl_NL" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="De Geheimen Die Topverdieners Niet Delen Over AI" />
        <meta name="twitter:description" content="Bewezen AI strategieën van €10K+ per maand verdieners - zelfs voor beginners" />
        
        {/* Blog Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "BeginnenMetAffiliate Blog",
            "description": "Bewezen affiliate marketing strategieën met AI - van beginners tot €10K+ per maand",
            "url": "https://beginnenmetaffiliate.nl/blog",
            "publisher": {
              "@type": "Organization",
              "name": "BeginnenMetAffiliate.nl",
              "logo": {
                "@type": "ImageObject",
                "url": "https://beginnenmetaffiliate.nl/logo.png"
              }
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://beginnenmetaffiliate.nl"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": "https://beginnenmetaffiliate.nl/blog"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <BlogHero />
      <BlogGrid />
    </Layout>
  );
};

export default Blog;
