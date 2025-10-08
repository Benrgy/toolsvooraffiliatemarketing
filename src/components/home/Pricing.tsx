import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "€297",
    period: "/maand",
    description: "Perfect voor beginners die willen starten met affiliate marketing automatisering",
    features: [
      "Tot 5 geautomatiseerde campagnes",
      "Basis AI optimalisatie",
      "Email support",
      "Maandelijkse rapportage",
      "Basis analytics dashboard",
    ],
    cta: "Start Nu",
    popular: false,
  },
  {
    name: "Professional",
    price: "€597",
    period: "/maand",
    description: "Voor professionals die hun affiliate inkomsten willen maximaliseren",
    features: [
      "Onbeperkte geautomatiseerde campagnes",
      "Geavanceerde AI optimalisatie",
      "Priority support (24/7)",
      "Real-time rapportage",
      "Volledig analytics dashboard",
      "A/B testing tools",
      "Custom integraties",
    ],
    cta: "Meest Populair",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Op maat gemaakte oplossingen voor grote organisaties en agencies",
    features: [
      "Alles uit Professional",
      "Dedicated account manager",
      "Custom AI modellen",
      "White-label oplossingen",
      "API toegang",
      "Custom training & onboarding",
      "SLA garanties",
    ],
    cta: "Contact Ons",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Transparante{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Prijzen
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kies het plan dat bij jouw doelen past. Geen verborgen kosten, annuleer wanneer je wilt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover-scale transition-smooth animate-fade-in ${
                plan.popular ? "border-primary shadow-primary-lg" : "shadow-card"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-primary shadow-primary">
                    Meest Gekozen
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular ? "gradient-primary shadow-primary" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  <Link to="/#contact">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
