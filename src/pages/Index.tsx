import { Layout } from "@/components/Layout";
import { Hero } from "@/components/home/Hero";
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
      
      {/* More sections will be added */}
    </Layout>
  );
};

export default Index;
