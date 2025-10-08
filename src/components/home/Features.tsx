import { Bot, Zap, TrendingUp, Shield, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "AI-Gedreven Automatisering",
    description: "Automatiseer repetitieve taken en laat AI je affiliate marketing optimaliseren voor maximale conversies.",
  },
  {
    icon: Zap,
    title: "Snelle Implementatie",
    description: "Binnen enkele dagen operationeel met onze plug-and-play oplossingen voor affiliate marketing.",
  },
  {
    icon: TrendingUp,
    title: "Verhoog Je Inkomsten",
    description: "Bewezen strategieën en tools die je affiliate inkomsten verhogen met gemiddeld 40-60%.",
  },
  {
    icon: Shield,
    title: "Veilig & Betrouwbaar",
    description: "Enterprise-grade beveiliging en 99.9% uptime voor je affiliate marketing operaties.",
  },
  {
    icon: Clock,
    title: "24/7 Beschikbaar",
    description: "Je automatisering werkt dag en nacht door, zodat je inkomsten blijven groeien terwijl jij slaapt.",
  },
  {
    icon: Sparkles,
    title: "Nederlandse Support",
    description: "Direct contact met Nederlandse experts die je helpen het maximale uit je automatisering te halen.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Waarom Kiezen Voor{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              AI Automatisering
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ontdek hoe onze AI-gedreven tools je affiliate marketing naar een hoger niveau tillen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover-scale transition-smooth shadow-card hover:shadow-card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
