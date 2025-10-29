import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Professional workspace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Handgeselecteerde AI Tools Directory</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Ontdek de Beste{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              AI Tools
            </span>
            {" "}voor Affiliate Marketing
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Vind handige AI automatiseringstools om je affiliate marketing naar een hoger niveau te tillen
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="gradient-primary shadow-primary text-lg h-14 px-8"
            >
              <Link to="/tools">
                Ontdek Alle Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="text-lg h-14 px-8">
              <Link to="/blog">Lees Onze Blog</Link>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Dagelijks Nieuwe Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Eerlijke Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Gratis & Betaalde Opties</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
