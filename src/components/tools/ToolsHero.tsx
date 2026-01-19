import { Search, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ToolsHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const stats = [
  { icon: Users, value: 10000, suffix: "+", label: "Marketers" },
  { icon: TrendingUp, value: 40, suffix: "%", label: "Meer conversies" },
  { icon: Zap, value: 20, suffix: "h", label: "Bespaard/week" },
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

export const ToolsHero = ({
  searchQuery,
  onSearchChange
}: ToolsHeroProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -20, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 30, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-success/30 text-sm font-medium text-success glow-success">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 10.000+ Succesvolle Affiliate Marketers</span>
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            De <span className="text-gradient">Complete Toolkit</span><br />
            Voor Affiliate Succes
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ontdek de AI-tools die topverdieners gebruiken om hun affiliate business 
            naar het volgende niveau te tillen.
          </motion.p>
          
          {/* Search Box */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative glass-card rounded-2xl p-2 glow-primary">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Zoek tools op naam, categorie of functionaliteit..." 
                value={searchQuery} 
                onChange={e => onSearchChange(e.target.value)} 
                className="pl-14 h-16 text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 rounded bg-muted font-mono">⌘</kbd>
                <kbd className="px-2 py-1 rounded bg-muted font-mono">K</kbd>
              </div>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8"
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
