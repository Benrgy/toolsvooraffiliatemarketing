import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
          tool_tags(tag),
          tool_features(feature)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-12" />
            <Skeleton className="h-64 w-full" />
          </div>
        </section>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl font-bold mb-4">Tool niet gevonden</h1>
            <Link to="/tools">
              <Button>Terug naar tools</Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{tool.name} - AI Tool voor Affiliate Marketing | Beginnen Met Affiliate</title>
        <meta name="description" content={tool.tagline} />
        <meta property="og:title" content={`${tool.name} - AI Tool`} />
        <meta property="og:description" content={tool.tagline} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://beginnenmetaffiliate.nl/tools/${tool.slug}`} />
      </Helmet>

      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Terug naar tools
          </Link>

          <div className="mb-8">
            {tool.logo_url && (
              <img 
                src={tool.logo_url} 
                alt={`${tool.name} logo`}
                className="h-16 w-16 rounded-lg mb-4 object-cover"
              />
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{tool.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">{tool.tagline}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {tool.category && (
                <Badge variant="secondary">{tool.category.name}</Badge>
              )}
              {tool.pricing_model && (
                <Badge variant="outline">{tool.pricing_model}</Badge>
              )}
              {tool.tool_tags?.map((tag: any, index: number) => (
                <Badge key={index} variant="outline">{tag.tag}</Badge>
              ))}
            </div>

            <a 
              href={tool.affiliate_link || tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2">
                Bezoek website
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Over deze tool</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{tool.description}</p>
              </div>
            </CardContent>
          </Card>

          {tool.tool_features && tool.tool_features.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Belangrijkste features</h2>
                <ul className="space-y-3">
                  {tool.tool_features.map((item: any, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default ToolDetail;