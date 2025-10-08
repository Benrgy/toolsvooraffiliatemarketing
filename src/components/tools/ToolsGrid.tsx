import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "./ToolCard";
import { Skeleton } from "@/components/ui/skeleton";

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
          category:category_id(name, slug)
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
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Geen tools gevonden</h2>
            <p className="text-muted-foreground">
              Probeer een andere zoekopdracht of filter
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
};