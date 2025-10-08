import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ToolsHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ToolsHero = ({ searchQuery, onSearchChange }: ToolsHeroProps) => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Ontdek de Beste{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              AI Tools
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Handgeselecteerde AI automatiseringstools om je affiliate marketing naar een hoger niveau te tillen
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Zoek tools op naam, categorie of functionaliteit..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};