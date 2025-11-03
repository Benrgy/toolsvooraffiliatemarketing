import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ArrowLeft, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";

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

      <div className="container mx-auto px-4 py-8 md:py-16">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/tools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Tools
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  {tool.logo_url ? (
                    <img 
                      src={tool.logo_url} 
                      alt={`${tool.name} logo`}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg border border-border bg-transparent flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">
                        {tool.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-3xl">{tool.name}</CardTitle>
                      {tool.featured && (
                        <Badge variant="outline" className="gap-1 border-primary text-primary">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-lg">
                      {tool.tagline}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tool.category && (
                    <Badge variant="secondary">{tool.category.name}</Badge>
                  )}
                  <Badge 
                    variant="outline"
                    className={
                      tool.pricing_model === 'free' 
                        ? 'border-success text-success' 
                        : tool.pricing_model === 'freemium'
                        ? 'border-primary text-primary'
                        : ''
                    }
                  >
                    {pricingLabel}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Over {tool.name}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tool.description}
                  </p>
                </div>

                {tool.tool_features && tool.tool_features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {tool.tool_features.map((feature: any, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{feature.feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool.tool_tags && tool.tool_tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.tool_tags.map((tag: any, index: number) => (
                        <Badge key={index} variant="outline">{tag.tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card sticky top-24">
              <CardHeader>
                <CardTitle>Bezoek {tool.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  asChild 
                  className="w-full gradient-primary shadow-primary" 
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
                
                <div className="pt-4 border-t space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prijsmodel</span>
                    <span className="font-medium">{pricingLabel}</span>
                  </div>
                  {tool.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categorie</span>
                      <span className="font-medium">{tool.category.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ToolDetail;