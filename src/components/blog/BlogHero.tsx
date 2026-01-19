import { Search, Sparkles, BookOpen, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import blogHeroBg from "@/assets/blog-hero-bg.jpg";

interface BlogHeroProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const stats = [
  { icon: BookOpen, value: 150, suffix: "+", label: "Artikelen" },
  { icon: Users, value: 10000, suffix: "+", label: "Lezers" },
  { icon: TrendingUp, value: 95, suffix: "%", label: "Tevreden" },
];

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const BlogHero = ({ searchQuery = "", onSearchChange }: BlogHeroProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={blogHeroBg} 
          alt="Digital knowledge landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/80" />
      </div>
      
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-[15%] w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            x: [0, 20, 0], 
            y: [0, -15, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-[10%] w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
            y: [0, 20, 0],
            scale: [1, 1.15, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/30 text-sm font-medium text-primary glow-primary">
              <Sparkles className="h-4 w-4" />
              <span>Kennisbank voor Affiliate Succes</span>
            </div>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            AI Affiliate Marketing{" "}
            <span className="text-gradient">Strategieën</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ontdek bewezen strategieën en inzichten van topverdieners 
            om je affiliate business te transformeren met AI.
          </motion.p>
          
          {/* Search Box */}
          {onSearchChange && (
            <motion.div 
              className="relative max-w-xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative glass-card rounded-2xl p-2 glow-primary">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Zoek artikelen..." 
                  value={searchQuery} 
                  onChange={e => onSearchChange(e.target.value)} 
                  className="pl-14 h-14 text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60" 
                />
              </div>
            </motion.div>
          )}
          
          {/* Stats */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="text-3xl md:text-4xl font-bold text-gradient">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
