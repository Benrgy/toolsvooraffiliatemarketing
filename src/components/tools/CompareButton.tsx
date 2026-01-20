import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompareButtonProps {
  selectedTools: string[];
  onRemove: (toolId: string) => void;
  onClear: () => void;
  tools: Array<{ id: string; name: string; logo_url: string | null }>;
}

export const CompareButton = ({ 
  selectedTools, 
  onRemove, 
  onClear,
  tools 
}: CompareButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedTools.length === 0) return null;

  const selectedToolsData = tools.filter(t => selectedTools.includes(t.id));

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
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="glass-card rounded-2xl shadow-elevated border border-primary/20 p-4 min-w-[300px] max-w-[500px]">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-semibold">Vergelijken</span>
              <Badge variant="secondary" className="text-xs">
                {selectedTools.length}/4
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Wissen
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            {selectedToolsData.map((tool) => (
              <motion.div
                key={tool.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative group"
              >
                {tool.logo_url ? (
                  <img 
                    src={tool.logo_url} 
                    alt={tool.name}
                    className="h-10 w-10 rounded-lg object-contain bg-white shadow-sm ring-1 ring-border/50 p-1"
                  />
                ) : (
                  <div className={`h-10 w-10 rounded-lg border border-primary/30 bg-gradient-to-br ${getGradientColors(tool.name)} flex items-center justify-center`}>
                    <span className="text-sm font-bold text-gradient">
                      {tool.name.charAt(0)}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onRemove(tool.id)}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
            
            {Array(4 - selectedTools.length).fill(0).map((_, i) => (
              <div 
                key={`empty-${i}`}
                className="h-10 w-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/50"
              >
                <span className="text-xs">+</span>
              </div>
            ))}
          </div>
          
          <Link to={`/tools/vergelijk?tools=${selectedTools.join(",")}`}>
            <Button 
              className="w-full gap-2" 
              disabled={selectedTools.length < 2}
            >
              Vergelijk {selectedTools.length} Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          
          {selectedTools.length < 2 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Selecteer minimaal 2 tools om te vergelijken
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
