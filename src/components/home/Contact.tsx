import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Naam is verplicht" })
    .max(100, { message: "Naam mag maximaal 100 tekens bevatten" }),
  email: z
    .string()
    .trim()
    .email({ message: "Ongeldig e-mailadres" })
    .max(255, { message: "E-mail mag maximaal 255 tekens bevatten" }),
  toolName: z
    .string()
    .trim()
    .min(1, { message: "Tool naam is verplicht" })
    .max(200, { message: "Tool naam mag maximaal 200 tekens bevatten" }),
  toolUrl: z
    .string()
    .trim()
    .url({ message: "Ongeldig URL formaat" })
    .max(500, { message: "URL mag maximaal 500 tekens bevatten" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Beschrijving is verplicht" })
    .max(1000, { message: "Beschrijving mag maximaal 1000 tekens bevatten" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const Contact = () => {
  const { toast } = useToast();
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      toolName: "",
      toolUrl: "",
      description: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // TODO: Connect to backend endpoint when ready
    toast({
      title: "Formulier gevalideerd",
      description: "Je suggestie is succesvol ontvangen!",
    });
    form.reset();
  };

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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Naam</FormLabel>
                          <FormControl>
                            <Input placeholder="Je naam" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="je@email.nl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="toolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool Naam</FormLabel>
                        <FormControl>
                          <Input placeholder="Naam van de AI tool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="toolUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Korte Beschrijving</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Vertel ons kort waarom deze tool geweldig is voor affiliate marketers..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full gradient-primary shadow-primary"
                    disabled={form.formState.isSubmitting}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Tool Indienen
                  </Button>
                </form>
              </Form>
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
