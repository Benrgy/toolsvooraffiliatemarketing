import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { 
  Star, 
  Check, 
  X, 
  Plus, 
  ArrowLeft, 
  ExternalLink,
  Scale,
  Sparkles
} from "lucide-react";
import { ToolSelector } from "@/components/tools/ToolSelector";

const ToolCompare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  // Parse tool IDs from URL
  useEffect(() => {
    const toolsParam = searchParams.get("tools");
    if (toolsParam) {
      setSelectedToolIds(toolsParam.split(",").filter(Boolean));
    }
  }, [searchParams]);

  // Fetch selected tools with features
  const { data: tools, isLoading } = useQuery({
    queryKey: ["compare-tools", selectedToolIds],
    queryFn: async () => {
      if (selectedToolIds.length === 0) return [];
      
      const { data: toolsData, error: toolsError } = await supabase
        .from("tools")
        .select(`
          *,
          category:category_id(name, slug, icon)
        `)
        .in("id", selectedToolIds);

      if (toolsError) throw toolsError;

      // Fetch features for each tool
      const { data: featuresData, error: featuresError } = await supabase
        .from("tool_features")
        .select("*")
        .in("tool_id", selectedToolIds);

      if (featuresError) throw featuresError;

      // Map features to tools
      return toolsData?.map(tool => ({
        ...tool,
        features: featuresData?.filter(f => f.tool_id === tool.id).map(f => f.feature) || []
      })) || [];
    },
    enabled: selectedToolIds.length > 0,
  });

  // Get all unique features
  const allFeatures = [...new Set(tools?.flatMap(t => t.features) || [])];

  const addTool = (toolId: string) => {
    if (!selectedToolIds.includes(toolId) && selectedToolIds.length < 4) {
      const newIds = [...selectedToolIds, toolId];
      setSelectedToolIds(newIds);
      setSearchParams({ tools: newIds.join(",") });
    }
    setShowSelector(false);
  };

  const removeTool = (toolId: string) => {
    const newIds = selectedToolIds.filter(id => id !== toolId);
    setSelectedToolIds(newIds);
    if (newIds.length > 0) {
      setSearchParams({ tools: newIds.join(",") });
    } else {
      setSearchParams({});
    }
  };

  const pricingConfig: Record<string, { label: string; className: string }> = {
    free: { label: 'Gratis', className: 'bg-success/10 text-success border-success/30' },
    freemium: { label: 'Freemium', className: 'bg-primary/10 text-primary border-primary/30' },
    paid: { label: 'Betaald', className: 'bg-accent/10 text-accent border-accent/30' },
    subscription: { label: 'Abonnement', className: 'bg-secondary/10 text-secondary-foreground border-secondary/30' },
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
    <Layout>
      <Helmet>
        <title>AI Tools Vergelijken | Vind de Beste Tool voor Jou</title>
        <meta
          name="description"
          content="Vergelijk AI tools naast elkaar op features, prijzen en ratings. Maak de beste keuze voor jouw affiliate marketing strategie."
        />
        <link rel="canonical" href="https://beginnenmetaffiliate.nl/tools/vergelijk" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium">
              <Scale className="h-4 w-4 text-primary" />
              <span>Tool Vergelijker</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Vergelijk <span className="text-gradient">AI Tools</span> Side-by-Side
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Selecteer tot 4 tools om direct te vergelijken op features, prijzen en gebruikersbeoordelingen
            </p>

            <Link to="/tools">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Terug naar alle tools
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          {selectedToolIds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-6"
            >
              <div className="mx-auto w-24 h-24 rounded-2xl glass-card flex items-center justify-center glow-primary">
                <Scale className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-bold">Begin met Vergelijken</h2>
                <p className="text-muted-foreground">
                  Selecteer minimaal 2 tools om ze naast elkaar te vergelijken
                </p>
              </div>
              <Button onClick={() => setShowSelector(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Tool Toevoegen
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Tool Headers */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selectedToolIds.length}, 1fr) ${selectedToolIds.length < 4 ? '120px' : ''}` }}>
                    <div className="flex items-end pb-4">
                      <span className="text-sm font-medium text-muted-foreground">Vergelijk</span>
                    </div>
                    
                    {isLoading ? (
                      Array(selectedToolIds.length).fill(0).map((_, i) => (
                        <div key={i} className="glass-card rounded-xl p-4 space-y-3">
                          <Skeleton className="h-16 w-16 rounded-xl" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))
                    ) : (
                      tools?.map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative glass-card rounded-xl p-4 space-y-3 group"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeTool(tool.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex items-center gap-3">
                            {tool.logo_url ? (
                              <img 
                                src={tool.logo_url} 
                                alt={tool.name}
                                className="h-14 w-14 rounded-xl object-contain bg-white shadow-card ring-2 ring-border/50 p-1"
                              />
                            ) : (
                              <div className={`h-14 w-14 rounded-xl border-2 border-primary/30 bg-gradient-to-br ${getGradientColors(tool.name)} flex items-center justify-center shadow-card`}>
                                <span className="text-2xl font-bold text-gradient">
                                  {tool.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            {tool.featured && (
                              <div className="absolute top-2 left-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-lg">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{tool.tagline}</p>
                          </div>
                          
                          <Link to={`/tools/${tool.slug}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <ExternalLink className="h-3 w-3" />
                              Bekijk Details
                            </Button>
                          </Link>
                        </motion.div>
                      ))
                    )}
                    
                    {selectedToolIds.length < 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Button
                          variant="outline"
                          className="h-full min-h-[180px] w-full border-dashed gap-2 flex-col"
                          onClick={() => setShowSelector(true)}
                        >
                          <Plus className="h-6 w-6" />
                          <span>Tool Toevoegen</span>
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              {tools && tools.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="overflow-x-auto glass-card rounded-xl"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="w-[200px] font-semibold">Kenmerk</TableHead>
                        {tools.map(tool => (
                          <TableHead key={tool.id} className="text-center font-semibold">
                            {tool.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Pricing Row */}
                      <TableRow className="border-border/50">
                        <TableCell className="font-medium">Prijsmodel</TableCell>
                        {tools.map(tool => {
                          const pricing = pricingConfig[tool.pricing_model as string] || { 
                            label: tool.pricing_model, 
                            className: '' 
                          };
                          return (
                            <TableCell key={tool.id} className="text-center">
                              <Badge variant="outline" className={pricing.className}>
                                {pricing.label}
                              </Badge>
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      {/* Rating Row */}
                      <TableRow className="border-border/50">
                        <TableCell className="font-medium">Rating</TableCell>
                        {tools.map(tool => (
                          <TableCell key={tool.id} className="text-center">
                            {tool.schema_rating ? (
                              <div className="inline-flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{tool.schema_rating}</span>
                                {tool.schema_review_count && (
                                  <span className="text-muted-foreground text-sm">
                                    ({tool.schema_review_count})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Category Row */}
                      <TableRow className="border-border/50">
                        <TableCell className="font-medium">Categorie</TableCell>
                        {tools.map(tool => (
                          <TableCell key={tool.id} className="text-center">
                            {tool.category?.name || '-'}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Features Rows */}
                      {allFeatures.length > 0 && (
                        <>
                          <TableRow className="border-border/50 bg-muted/30">
                            <TableCell colSpan={tools.length + 1} className="font-semibold text-primary">
                              Features
                            </TableCell>
                          </TableRow>
                          {allFeatures.map((feature, index) => (
                            <TableRow key={index} className="border-border/50">
                              <TableCell className="font-medium">{feature}</TableCell>
                              {tools.map(tool => (
                                <TableCell key={tool.id} className="text-center">
                                  {tool.features.includes(feature) ? (
                                    <Check className="h-5 w-5 text-success mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </>
                      )}

                      {/* Website Row */}
                      <TableRow className="border-border/50">
                        <TableCell className="font-medium">Website</TableCell>
                        {tools.map(tool => (
                          <TableCell key={tool.id} className="text-center">
                            <a 
                              href={tool.affiliate_link || tool.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Bezoeken
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tool Selector Modal */}
      <ToolSelector 
        open={showSelector} 
        onOpenChange={setShowSelector}
        onSelect={addTool}
        excludeIds={selectedToolIds}
      />
    </Layout>
  );
};

export default ToolCompare;
