import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    // Hidden admin access: Ctrl+Shift+A
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Beginnen Met Affiliate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium transition-smooth hover:text-primary">
              Home
            </Link>
            <Link to="/tools" className="text-sm font-medium transition-smooth hover:text-primary">
              Tools
            </Link>
            <Link to="/blog" className="text-sm font-medium transition-smooth hover:text-primary">
              Blog
            </Link>
            <Button asChild className="gradient-primary shadow-primary">
              <Link to="/#contact">Contact</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-sm font-medium transition-smooth hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/tools"
                className="text-sm font-medium transition-smooth hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Tools
              </Link>
              <Link
                to="/blog"
                className="text-sm font-medium transition-smooth hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Button asChild className="gradient-primary shadow-primary w-full">
                <Link to="/#contact" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
