import { Sparkles } from "lucide-react";

export const BlogHero = () => {
  return (
    <section className="gradient-hero py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Kennisbank</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            AI Affiliate Marketing{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Blog
            </span>
          </h1>

          <p className="text-xl text-muted-foreground">
            Ontdek tips, strategieën en inzichten om je affiliate marketing naar een hoger niveau te tillen met AI automatisering.
          </p>
        </div>
      </div>
    </section>
  );
};
