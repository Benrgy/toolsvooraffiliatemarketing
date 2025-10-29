import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ToolCardProps {
  tool: any;
}

export const ToolCard = ({ tool }: ToolCardProps) => {
  return (
    <Link to={`/tools/${tool.slug}`}>
      <Card className="group hover-scale transition-smooth shadow-card hover:shadow-card-hover h-full">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            {tool.logo_url ? (
              <img 
                src={tool.logo_url} 
                alt={`${tool.name} logo`}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border border-border bg-transparent flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
            {tool.featured && (
              <Badge variant="outline" className="gap-1 border-primary text-primary">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {tool.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {tool.tagline}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tool.category && (
              <Badge variant="secondary">{tool.category.name}</Badge>
            )}
            {tool.pricing_model && (
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
                {tool.pricing_model === 'free' ? 'Gratis' : 
                 tool.pricing_model === 'freemium' ? 'Freemium' : 
                 tool.pricing_model === 'paid' ? 'Betaald' : 
                 tool.pricing_model === 'subscription' ? 'Abonnement' : 
                 tool.pricing_model}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};