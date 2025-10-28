import { Layout } from "@/components/Layout";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogHero } from "@/components/blog/BlogHero";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  return (
    <Layout>
      <Helmet>
        <title>AI Affiliate Marketing Blog - Tips & Strategieën</title>
        <meta name="title" content="AI Affiliate Marketing Blog - Tips & Strategieën" />
        <meta
          name="description"
          content="Ontdek de beste tips, trucs en strategieën voor affiliate marketing met AI automatisering. Leer hoe je je inkomsten maximaliseert."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/blog" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://beginnenmetaffiliate.nl/blog" />
        <meta property="og:title" content="AI Affiliate Marketing Blog - Tips & Strategieën" />
        <meta
          property="og:description"
          content="Tips en strategieën voor affiliate marketing met AI automatisering."
        />
        <meta property="og:site_name" content="BeginnenMetAffiliate.nl" />
        <meta property="og:locale" content="nl_NL" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Affiliate Marketing Blog - Tips & Strategieën" />
        <meta name="twitter:description" content="Tips en strategieën voor affiliate marketing met AI automatisering." />
      </Helmet>

      <BlogHero />
      <BlogGrid />
    </Layout>
  );
};

export default Blog;
