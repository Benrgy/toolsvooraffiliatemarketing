import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ToolsFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedPricing: string | null;
  onPricingChange: (pricing: string | null) => void;
}

export const ToolsFilters = ({
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
}: ToolsFiltersProps) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const pricingOptions = [
    { value: "free", label: "Gratis" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Betaald" },
    { value: "subscription", label: "Abonnement" },
  ];

  if (isLoading) {
    return (
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-b sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Categorieën</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCategoryChange(null)}
                className={`flex-shrink-0 ${selectedCategory === null ? 'border-primary text-primary' : ''}`}
              >
                Alle
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onCategoryChange(category.slug)}
                  className={`flex-shrink-0 ${selectedCategory === category.slug ? 'border-primary text-primary' : ''}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Prijsmodel</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPricingChange(null)}
                className={`flex-shrink-0 ${selectedPricing === null ? 'border-primary text-primary' : ''}`}
              >
                Alle
              </Button>
              {pricingOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onPricingChange(option.value)}
                  className={`flex-shrink-0 ${selectedPricing === option.value ? 'border-primary text-primary' : ''}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};