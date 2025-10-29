import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ToolsHero } from "@/components/tools/ToolsHero";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { ToolsFilters } from "@/components/tools/ToolsFilters";
import { Helmet } from "react-helmet-async";

const Tools = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);

  return (
    <Layout>
      <Helmet>
        <title>21+ Beste AI Tools Die Je Affiliate Inkomsten Verdubbelen</title>
        <meta
          name="description"
          content="De geheime toolkit van topverdieners - trusted by 10.000+ affiliate marketers. Bespaar 20 uur per week en verhoog conversies met 40%. Gratis opties beschikbaar."
        />
        <meta property="og:title" content="21+ Beste AI Tools Die Je Affiliate Inkomsten Verdubbelen" />
        <meta
          property="og:description"
          content="Trusted by 10.000+ marketers - bespaar 20 uur per week en verhoog conversies met 40%"
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/tools" />
      </Helmet>
      
      <ToolsHero 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ToolsFilters 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPricing={selectedPricing}
        onPricingChange={setSelectedPricing}
      />
      <ToolsGrid 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedPricing={selectedPricing}
      />
    </Layout>
  );
};

export default Tools;