import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import toolsHeroBg from "@/assets/tools-hero-bg.jpg";
interface ToolsHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
export const ToolsHero = ({
  searchQuery,
  onSearchChange
}: ToolsHeroProps) => {
  return <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={toolsHeroBg} alt="Digital workspace with AI tools" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success/30 bg-success/5 text-sm font-medium text-success mb-4">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Trusted by 10.000+ Succesvolle Affiliate Marketers</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Bespaar 20 Uur Per Week en Verhoog Je Conversies Met 40%
          </h1>
          <p className="text-xl text-muted-foreground">
            De complete toolkit die topverdieners gebruiken - van content creatie tot conversie optimalisatie. Gratis en betaalde opties.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Zoek tools op naam, categorie of functionaliteit..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-12 h-14 text-lg" />
          </div>
        </div>
      </div>
    </section>;
};