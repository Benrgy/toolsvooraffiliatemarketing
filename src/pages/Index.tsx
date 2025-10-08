import { Layout } from "@/components/Layout";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Pricing } from "@/components/home/Pricing";
import { Contact } from "@/components/home/Contact";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Beginnen Met Affiliate Marketing - AI Automatisering voor Succes</title>
        <meta
          name="description"
          content="Automatiseer je affiliate marketing met AI. Verhoog je inkomsten met slimme tools en strategieën. Start vandaag nog!"
        />
        <meta property="og:title" content="Beginnen Met Affiliate Marketing - AI Automatisering" />
        <meta
          property="og:description"
          content="Automatiseer je affiliate marketing met AI. Verhoog je inkomsten met slimme tools en strategieën."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/" />
      </Helmet>
      
      <Hero />
      <Features />
      <Pricing />
      <Contact />
    </Layout>
  );
};

export default Index;
