import { Link } from "react-router-dom";
import { Sparkles, Mail, Linkedin, Twitter, ArrowUpRight, Heart } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  navigatie: [
    { href: "/", label: "Home" },
    { href: "/tools", label: "AI Tools" },
    { href: "/blog", label: "Blog" },
    { href: "/#contact", label: "Contact" },
  ],
  categories: [
    { href: "/tools?category=content-creatie", label: "Content Creatie" },
    { href: "/tools?category=seo-marketing", label: "SEO & Marketing" },
    { href: "/tools?category=email-automatisering", label: "Email Automatisering" },
    { href: "/tools?category=analytics", label: "Analytics" },
  ],
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative border-t overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh opacity-20" />
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg group-hover:bg-primary/30 transition-all duration-300" />
                <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <span className="text-lg font-bold">
                Tools<span className="text-gradient">Voor</span>Affiliate
              </span>
            </Link>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ontdek de beste AI tools om je affiliate marketing te automatiseren 
              en naar een hoger niveau te tillen.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-all duration-300 glow-primary-hover"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-all duration-300 glow-primary-hover"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@toolsvooraffiliate.nl"
                className="p-2.5 rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-all duration-300 glow-primary-hover"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
          
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-muted-foreground">
              Navigatie
            </h3>
            <ul className="space-y-3">
              {footerLinks.navigatie.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-muted-foreground">
              Categorieën
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Newsletter / Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>
            
            <div className="glass-card rounded-2xl p-5 space-y-4 glow-primary">
              <p className="text-sm text-muted-foreground">
                Heb je vragen of suggesties? We horen graag van je!
              </p>
              <a
                href="mailto:info@toolsvooraffiliate.nl"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                info@toolsvooraffiliate.nl
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-border/50 mt-12 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {currentYear} Tools Voor Affiliate Marketing. Alle rechten voorbehouden.
            </p>
            <p className="flex items-center gap-1">
              Gemaakt met <Heart className="h-4 w-4 text-red-500 fill-current" /> in Nederland
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
