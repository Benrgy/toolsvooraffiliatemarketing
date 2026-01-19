import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "./ToolCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";

interface ToolsGridProps {
  searchQuery: string;
  selectedCategory: string | null;
  selectedPricing: string | null;
}

export const ToolsGrid = ({ searchQuery, selectedCategory, selectedPricing }: ToolsGridProps) => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["tools", searchQuery, selectedCategory, selectedPricing],
    queryFn: async () => {
      let query = supabase
        .from("tools")
        .select(`
          *,
          category:category_id(name, slug, icon)
        `)
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategory)
          .single();
        
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (selectedPricing) {
        query = query.eq("pricing_model", selectedPricing);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4 glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center space-y-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto w-20 h-20 rounded-2xl glass-card flex items-center justify-center glow-primary">
              {searchQuery ? (
                <Search className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Package className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Geen tools gevonden</h2>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `Geen resultaten voor "${searchQuery}". Probeer een andere zoekopdracht.`
                  : "Er zijn momenteel geen tools die aan je criteria voldoen."
                }
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Results count */}
        <motion.div 
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{tools.length}</span> tools gevonden
          </p>
        </motion.div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
