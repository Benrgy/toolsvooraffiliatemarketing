import { Link } from "react-router-dom";
import { Sparkles, Mail, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Beginnen Met Affiliate</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Ontdek de beste AI tools om je affiliate marketing te automatiseren en naar een hoger niveau te tillen.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Navigatie</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Populaire Categorieën</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tools?category=content-creatie" className="hover:text-primary transition-smooth">
                  Content Creatie
                </Link>
              </li>
              <li>
                <Link to="/tools?category=seo-marketing" className="hover:text-primary transition-smooth">
                  SEO & Marketing
                </Link>
              </li>
              <li>
                <Link to="/tools?category=email-automatisering" className="hover:text-primary transition-smooth">
                  Email Automatisering
                </Link>
              </li>
              <li>
                <Link to="/tools?category=analytics" className="hover:text-primary transition-smooth">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <a
                href="mailto:info@beginnenmetaffiliate.nl"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                <Mail className="h-4 w-4" />
                info@beginnenmetaffiliate.nl
              </a>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Beginnen Met Affiliate Marketing. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
};
