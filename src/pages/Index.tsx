import { Layout } from "@/components/Layout";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Contact } from "@/components/home/Contact";
import { FeaturedTools } from "@/components/home/FeaturedTools";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Beginnen Met Affiliate Marketing - Ontdek de Beste AI Tools</title>
        <meta
          name="description"
          content="Vind de beste AI tools om je affiliate marketing te automatiseren. Van content creatie tot conversie optimalisatie - ontdek handige tools."
        />
        <meta property="og:title" content="AI Tools voor Affiliate Marketing Automatisering" />
        <meta
          property="og:description"
          content="Ontdek handige AI automatiseringstools voor affiliate marketing succes"
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/" />
      </Helmet>
      
      <Hero />
      <FeaturedTools />
      <Features />
      <Contact />
    </Layout>
  );
};

export default Index;
