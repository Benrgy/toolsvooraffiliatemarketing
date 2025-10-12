import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Mis je een{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                AI Tool?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Heb je een geweldige AI tool gevonden die hier nog niet op staat? Laat het ons weten en we voegen hem toe aan onze directory!
            </p>
          </div>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam</Label>
                    <Input id="name" placeholder="Je naam" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="je@email.nl" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tool-name">Tool Naam</Label>
                  <Input id="tool-name" placeholder="Naam van de AI tool" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tool-url">Website URL</Label>
                  <Input id="tool-url" placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Korte Beschrijving</Label>
                  <Textarea
                    id="message"
                    placeholder="Vertel ons kort waarom deze tool geweldig is voor affiliate marketers..."
                    rows={4}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gradient-primary shadow-primary">
                  <Send className="mr-2 h-5 w-5" />
                  Tool Indienen
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            We beoordelen elke inzending en voegen relevante AI tools toe aan onze directory.
          </p>
        </div>
      </div>
    </section>
  );
};
