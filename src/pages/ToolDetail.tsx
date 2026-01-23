import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ArrowLeft, Star, Check, Scale, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState } from "react";

const ToolDetail = () => {
  const { slug } = useParams();

  const { data: tool, isLoading } = useQuery({
    queryKey: ["tool", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select(`
          *,
          category:category_id(name, slug),
          tool_features(feature),
          tool_tags(tag)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Tool niet gevonden</h1>
            <p className="text-muted-foreground">
              De tool die je zoekt bestaat niet of is niet meer beschikbaar.
            </p>
            <Button asChild>
              <Link to="/tools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar Tools
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const pricingLabel = 
    tool.pricing_model === 'free' ? 'Gratis' : 
    tool.pricing_model === 'freemium' ? 'Freemium' : 
    tool.pricing_model === 'paid' ? 'Betaald' : 
    tool.pricing_model === 'subscription' ? 'Abonnement' : 
    tool.pricing_model;

  return (
    <Layout>
      <Helmet>
        <title>{tool.name} Review 2025: Verhoog Je Conversies Met Deze AI Tool</title>
        <meta name="description" content={`${tool.tagline} - Ontdek waarom 1000+ affiliate marketers ${tool.name} vertrouwen. Eerlijke review met voor- en nadelen.`} />
        <meta property="og:title" content={`${tool.name} Review 2025: Waarom 1000+ Marketers Deze Tool Gebruiken`} />
        <meta property="og:description" content={`${tool.tagline} - Bewezen resultaten voor affiliate marketing succes`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://beginnenmetaffiliate.nl/tools/${tool.slug}`} />
        {tool.logo_url && <meta property="og:image" content={tool.logo_url} />}
        <link rel="canonical" href={`https://beginnenmetaffiliate.nl/tools/${tool.slug}`} />
        
        {/* SoftwareApplication Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tool.name,
            "description": tool.description,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": tool.pricing_model === 'free' ? "0" : undefined,
              "priceCurrency": "EUR"
            },
            "aggregateRating": tool.upvotes > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": "4.5",
              "reviewCount": tool.upvotes.toString()
            } : undefined
          })}
        </script>
        
        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://beginnenmetaffiliate.nl"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Tools",
                "item": "https://beginnenmetaffiliate.nl/tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": tool.name,
                "item": `https://beginnenmetaffiliate.nl/tools/${tool.slug}`
              }
            ]
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/tools">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Tools
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start gap-6"
          >
            {/* Logo */}
            <div className="relative">
              {tool.logo_url ? (
                <div className="relative">
                  <img 
                    src={tool.logo_url} 
                    alt={`${tool.name} logo`}
                    className="h-24 w-24 rounded-2xl object-contain bg-white shadow-elevated ring-2 ring-border/50 p-2"
                  />
                  <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-success border-2 border-background flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-success-foreground" />
                  </div>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shadow-elevated">
                  <span className="text-4xl font-bold text-gradient">
                    {tool.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">{tool.name}</h1>
                {tool.featured && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-primary">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </div>
                )}
              </div>
              
              <p className="text-xl text-muted-foreground">{tool.tagline}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                {tool.schema_rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{tool.schema_rating}</span>
                    {tool.schema_review_count && (
                      <span className="text-muted-foreground text-sm">
                        ({tool.schema_review_count} reviews)
                      </span>
                    )}
                  </div>
                )}
                {tool.category && (
                  <Badge variant="secondary" className="text-sm">{tool.category.name}</Badge>
                )}
                <Badge 
                  variant="outline"
                  className={`text-sm ${
                    tool.pricing_model === 'free' 
                      ? 'border-success text-success bg-success/10' 
                      : tool.pricing_model === 'freemium'
                      ? 'border-primary text-primary bg-primary/10'
                      : tool.pricing_model === 'paid'
                      ? 'border-accent text-accent bg-accent/10'
                      : ''
                  }`}
                >
                  {pricingLabel}
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Description */}
              <Card className="glass-card border-glow">
                <CardHeader>
                  <CardTitle className="text-2xl">Waarom {tool.name}?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              {tool.tool_features && tool.tool_features.length > 0 && (
                <Card className="glass-card border-glow">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Check className="h-5 w-5 text-success" />
                      Belangrijkste Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tool.tool_features.map((feature: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{feature.feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {tool.tool_tags && tool.tool_tags.length > 0 && (
                <Card className="glass-card border-glow">
                  <CardHeader>
                    <CardTitle className="text-xl">Gerelateerde Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tool.tool_tags.map((tag: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="px-3 py-1.5 text-sm"
                        >
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compare CTA */}
              <Card className="glass-card border-glow overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
                <CardContent className="relative py-8">
                  <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Vergelijk met andere tools</h3>
                      <p className="text-muted-foreground">Bekijk hoe {tool.name} zich verhoudt tot alternatieven</p>
                    </div>
                    <Link to={`/tools/vergelijk?tools=${tool.id}`}>
                      <Button variant="outline" className="gap-2">
                        <Scale className="h-4 w-4" />
                        Start Vergelijking
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* CTA Card */}
              <Card className="glass-card border-glow sticky top-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl">Probeer {tool.name}</CardTitle>
                  <CardDescription>Start vandaag nog met deze tool</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <Button 
                    asChild 
                    className="w-full gradient-primary shadow-primary glow-primary-hover" 
                    size="lg"
                  >
                    <a 
                      href={tool.affiliate_link || tool.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Bezoek Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  
                  <div className="pt-4 border-t border-border/50 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Prijsmodel</span>
                      <Badge 
                        variant="outline"
                        className={`${
                          tool.pricing_model === 'free' 
                            ? 'border-success text-success' 
                            : tool.pricing_model === 'freemium'
                            ? 'border-primary text-primary'
                            : ''
                        }`}
                      >
                        {pricingLabel}
                      </Badge>
                    </div>
                    {tool.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Categorie</span>
                        <span className="font-medium">{tool.category.name}</span>
                      </div>
                    )}
                    {tool.schema_rating && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{tool.schema_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      <span>Geverifieerde tool</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      <span>Affiliate link voor beste prijs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ToolDetail;