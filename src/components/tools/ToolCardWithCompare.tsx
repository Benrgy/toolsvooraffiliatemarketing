import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowUpRight, Sparkles, Check, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ToolCardWithCompareProps {
  tool: any;
  index?: number;
  isInCompare: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
}

export const ToolCardWithCompare = ({ 
  tool, 
  index = 0,
  isInCompare,
  onToggleCompare,
  compareDisabled
}: ToolCardWithCompareProps) => {
  const [logoError, setLogoError] = useState(false);
  
  const pricingConfig = {
    free: { label: 'Gratis', className: 'bg-success/10 text-success border-success/30' },
    freemium: { label: 'Freemium', className: 'bg-primary/10 text-primary border-primary/30' },
    paid: { label: 'Betaald', className: 'bg-accent/10 text-accent border-accent/30' },
    subscription: { label: 'Abonnement', className: 'bg-secondary/10 text-secondary-foreground border-secondary/30' },
  };
  
  const pricing = pricingConfig[tool.pricing_model as keyof typeof pricingConfig] || { 
    label: tool.pricing_model, 
    className: '' 
  };
  
  const getGradientColors = (name: string) => {
    const colors = [
      'from-blue-500/20 to-cyan-500/10',
      'from-purple-500/20 to-pink-500/10',
      'from-green-500/20 to-emerald-500/10',
      'from-orange-500/20 to-amber-500/10',
      'from-red-500/20 to-rose-500/10',
      'from-indigo-500/20 to-violet-500/10',
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="relative"
    >
      <Link to={`/tools/${tool.slug}`} className="block group">
        <div className={`relative h-full glass-card rounded-2xl p-6 transition-all duration-500 hover:shadow-elevated glow-primary-hover border-glow overflow-hidden ${isInCompare ? 'ring-2 ring-primary' : ''}`}>
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Featured indicator */}
          {tool.featured && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-primary">
                <Sparkles className="h-3 w-3" />
                Featured
              </div>
            </div>
          )}
          
          {/* Compare indicator */}
          {isInCompare && (
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                <Scale className="h-3 w-3" />
              </div>
            </div>
          )}
          
          <div className="relative z-10 space-y-4">
            {/* Logo & Category */}
            <div className="flex items-start justify-between">
              <div className="relative">
              {tool.logo_url && !logoError ? (
                  <div className="relative">
                    <img 
                      src={tool.logo_url} 
                      alt={`${tool.name} logo`}
                      className="h-14 w-14 rounded-xl object-contain bg-white shadow-card ring-2 ring-border/50 p-1"
                      onError={() => setLogoError(true)}
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-success-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className={`h-14 w-14 rounded-xl border-2 border-primary/30 bg-gradient-to-br ${getGradientColors(tool.name)} flex items-center justify-center shadow-card`}>
                    <span className="text-2xl font-bold text-gradient">
                      {tool.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {tool.category && (
                <Badge variant="secondary" className="bg-muted/80 text-xs">
                  {tool.category.name}
                </Badge>
              )}
            </div>
            
            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                {tool.name}
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {tool.tagline}
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <Badge 
                variant="outline"
                className={`${pricing.className} text-xs font-medium`}
              >
                {pricing.label}
              </Badge>
              
              {tool.schema_rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{tool.schema_rating}</span>
                  {tool.schema_review_count && (
                    <span className="text-muted-foreground">
                      ({tool.schema_review_count})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom hover bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </Link>
      
      {/* Compare Button */}
      <Button
        variant={isInCompare ? "default" : "outline"}
        size="sm"
        className="absolute bottom-4 right-4 z-20 gap-1.5 shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleCompare();
        }}
        disabled={compareDisabled}
      >
        <Scale className="h-3.5 w-3.5" />
        {isInCompare ? "Geselecteerd" : "Vergelijk"}
      </Button>
    </motion.div>
  );
};
