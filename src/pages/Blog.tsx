import { Layout } from "@/components/Layout";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogHero } from "@/components/blog/BlogHero";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  return (
    <Layout>
      <Helmet>
        <title>AI Affiliate Marketing Blog - Tips & Strategieën</title>
        <meta
          name="description"
          content="Ontdek de beste tips, trucs en strategieën voor affiliate marketing met AI automatisering. Leer hoe je je inkomsten maximaliseert."
        />
        <meta property="og:title" content="AI Affiliate Marketing Blog" />
        <meta
          property="og:description"
          content="Tips en strategieën voor affiliate marketing met AI automatisering."
        />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/blog" />
      </Helmet>

      <BlogHero />
      <BlogGrid />
    </Layout>
  );
};

export default Blog;
