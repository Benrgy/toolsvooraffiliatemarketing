import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/tools/ToolCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export const FeaturedTools = () => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["featured-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select(`
          *,
          category:category_id(name, slug)
        `)
        .eq("status", "published")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Featured{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              AI Tools
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handgeselecteerde top tools die onze community het meest helpen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/tools">
            <Button size="lg" className="gap-2">
              Bekijk Alle Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};