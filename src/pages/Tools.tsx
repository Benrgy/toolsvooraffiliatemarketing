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
        <title>AI Tools voor Affiliate Marketing Automatisering | Ontdek Slimme Tools</title>
        <meta
          name="description"
          content="Vind de beste AI tools om je affiliate marketing te automatiseren. Van content creatie tot conversie optimalisatie - ontdek tools die echt werken."
        />
        <meta property="og:title" content="AI Tools Directory voor Affiliate Marketers" />
        <meta
          property="og:description"
          content="Ontdek handige AI automatiseringstools voor affiliate marketing succes"
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