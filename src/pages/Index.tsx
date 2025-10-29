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
        <title>Verhoog Je Affiliate Inkomsten Met 40% in 90 Dagen</title>
        <meta
          name="description"
          content="Ontdek de geheime AI tools die 10.000+ affiliate marketers gebruiken om hun inkomsten te verdubbelen - zonder extra werkuren. Bewezen methode, gratis te starten."
        />
        <meta property="og:title" content="Verhoog Je Affiliate Inkomsten Met 40% in 90 Dagen" />
        <meta
          property="og:description"
          content="Join 10.000+ succesvolle affiliate marketers die hun inkomsten verdubbelden met deze AI tools"
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
