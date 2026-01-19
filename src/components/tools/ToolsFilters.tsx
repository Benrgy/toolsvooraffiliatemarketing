import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Filter, Sparkles } from "lucide-react";

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
    { value: "free", label: "Gratis", emoji: "🆓" },
    { value: "freemium", label: "Freemium", emoji: "⚡" },
    { value: "paid", label: "Betaald", emoji: "💎" },
    { value: "subscription", label: "Abonnement", emoji: "🔄" },
  ];

  if (isLoading) {
    return (
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28 flex-shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const FilterChip = ({ 
    isActive, 
    onClick, 
    children,
    variant = 'default'
  }: { 
    isActive: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    variant?: 'default' | 'pricing';
  }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0
        ${isActive 
          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-primary' 
          : 'glass-card hover:bg-muted/50 text-foreground'
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId={variant === 'pricing' ? 'pricing-active' : 'category-active'}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/90"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );

  return (
    <section className="py-6 sticky top-16 glass border-b border-border/50 z-40">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Categorieën
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <FilterChip
                isActive={selectedCategory === null}
                onClick={() => onCategoryChange(null)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Alle Tools
              </FilterChip>
              {categories?.map((category) => (
                <FilterChip
                  key={category.id}
                  isActive={selectedCategory === category.slug}
                  onClick={() => onCategoryChange(category.slug)}
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>💰</span>
              Prijsmodel
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <FilterChip
                isActive={selectedPricing === null}
                onClick={() => onPricingChange(null)}
                variant="pricing"
              >
                Alle prijzen
              </FilterChip>
              {pricingOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  isActive={selectedPricing === option.value}
                  onClick={() => onPricingChange(option.value)}
                  variant="pricing"
                >
                  <span>{option.emoji}</span>
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
