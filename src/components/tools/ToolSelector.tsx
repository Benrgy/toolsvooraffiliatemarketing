import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Star, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ToolSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (toolId: string) => void;
  excludeIds: string[];
}

export const ToolSelector = ({ 
  open, 
  onOpenChange, 
  onSelect, 
  excludeIds 
}: ToolSelectorProps) => {
  const [search, setSearch] = useState("");

  const { data: tools, isLoading } = useQuery({
    queryKey: ["all-tools-for-compare"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select(`
          id,
          name,
          slug,
          tagline,
          logo_url,
          pricing_model,
          schema_rating,
          category:category_id(name)
        `)
        .eq("status", "published")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const filteredTools = tools?.filter(tool => 
    !excludeIds.includes(tool.id) &&
    (tool.name.toLowerCase().includes(search.toLowerCase()) ||
     tool.tagline.toLowerCase().includes(search.toLowerCase()))
  );

  const pricingConfig: Record<string, { label: string; className: string }> = {
    free: { label: 'Gratis', className: 'bg-success/10 text-success' },
    freemium: { label: 'Freemium', className: 'bg-primary/10 text-primary' },
    paid: { label: 'Betaald', className: 'bg-accent/10 text-accent' },
    subscription: { label: 'Abonnement', className: 'bg-secondary/10 text-secondary-foreground' },
  };

  const getGradientColors = (name: string) => {
    const colors = [
      'from-blue-500/20 to-cyan-500/10',
      'from-purple-500/20 to-pink-500/10',
      'from-green-500/20 to-emerald-500/10',
      'from-orange-500/20 to-amber-500/10',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold">
            Tool Toevoegen aan Vergelijking
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek een tool..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : filteredTools && filteredTools.length > 0 ? (
            <div className="space-y-2">
              {filteredTools.map((tool, index) => {
                const pricing = pricingConfig[tool.pricing_model as string] || { 
                  label: tool.pricing_model, 
                  className: '' 
                };
                
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
                  >
                    {tool.logo_url ? (
                      <img 
                        src={tool.logo_url} 
                        alt={tool.name}
                        className="h-12 w-12 rounded-lg object-contain bg-white shadow-sm ring-1 ring-border/50 p-1"
                      />
                    ) : (
                      <div className={`h-12 w-12 rounded-lg border border-primary/30 bg-gradient-to-br ${getGradientColors(tool.name)} flex items-center justify-center`}>
                        <span className="text-lg font-bold text-gradient">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{tool.name}</h4>
                        {tool.schema_rating && (
                          <div className="flex items-center gap-0.5 text-sm">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{tool.schema_rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{tool.tagline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {tool.category?.name && (
                          <Badge variant="secondary" className="text-xs">
                            {tool.category.name}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${pricing.className}`}>
                          {pricing.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => onSelect(tool.id)}
                      className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-4 w-4" />
                      Toevoegen
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen tools gevonden{search && ` voor "${search}"`}</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
