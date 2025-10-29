import { Bot, Zap, TrendingUp, Shield, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const features = [{
  icon: Bot,
  title: "Content Generatie",
  description: "Vind tools die automatisch SEO-geoptimaliseerde content creëren voor je affiliate websites en blogs."
}, {
  icon: Zap,
  title: "Conversie Optimalisatie",
  description: "Ontdek AI tools die je landingspages analyseren en optimaliseren voor hogere conversies."
}, {
  icon: TrendingUp,
  title: "Analytics & Tracking",
  description: "Tools die je data analyseren en voorspellen welke producten het beste presteren."
}, {
  icon: Shield,
  title: "Email Marketing",
  description: "Automatiseer je email campagnes met slimme AI tools die personaliseren op individueel niveau."
}, {
  icon: Clock,
  title: "Social Media Automatisering",
  description: "Plan en optimaliseer je social media posts met AI voor maximale engagement."
}, {
  icon: Sparkles,
  title: "SEO Tools",
  description: "Vind de beste AI SEO tools om hoger te ranken in Google en meer organisch verkeer te krijgen."
}];
export const Features = () => {
  return <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Welke Tools{" "}
            
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Van content creatie tot conversie optimalisatie - ontdek de tools die jou helpen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <Card key={index} className="group hover-scale transition-smooth shadow-card hover:shadow-card-hover animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4 transition-smooth">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};