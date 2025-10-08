import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

export const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Bericht verzonden!",
      description: "We nemen binnen 24 uur contact met je op.",
    });

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Neem{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Contact Op
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Benieuwd hoe wij jouw affiliate marketing kunnen automatiseren? Laat je gegevens achter en we nemen contact met je op.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold mb-6">Stuur ons een bericht</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Naam *</Label>
                  <Input id="name" required placeholder="Je volledige naam" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required placeholder="je@email.nl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer</Label>
                  <Input id="phone" type="tel" placeholder="+31 6 12345678" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Bericht *</Label>
                  <Textarea
                    id="message"
                    required
                    placeholder="Vertel ons over je affiliate marketing doelen..."
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-primary shadow-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verzenden..." : "Verstuur Bericht"}
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Informatie</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">info@beginnenmetaffiliate.nl</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Telefoon</h4>
                    <p className="text-muted-foreground">+31 (0)20 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Locatie</h4>
                    <p className="text-muted-foreground">
                      Amsterdam, Nederland
                      <br />
                      Op afspraak
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-6 space-y-4">
              <h4 className="font-semibold">Snel Antwoord?</h4>
              <p className="text-sm text-muted-foreground">
                We streven ernaar om binnen 24 uur te reageren op alle aanvragen. Voor dringende vragen kun je ook direct bellen tijdens kantooruren (ma-vr 9:00-17:00).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
