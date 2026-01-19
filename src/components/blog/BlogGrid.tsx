import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogCard } from "./BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BookOpen, Filter, Sparkles } from "lucide-react";
import { useState } from "react";

const categories = [
  { value: null, label: "Alle Artikelen", emoji: "✨" },
  { value: "AI Tools", label: "AI Tools", emoji: "🤖" },
  { value: "Strategieën", label: "Strategieën", emoji: "📈" },
  { value: "Tutorials", label: "Tutorials", emoji: "📚" },
  { value: "Case Studies", label: "Case Studies", emoji: "💡" },
];

export const BlogGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ["published-posts", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          display_author:display_author_id(*)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Category filter skeleton */}
          <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28 flex-shrink-0 rounded-full" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-3 pt-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center space-y-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto w-20 h-20 rounded-2xl glass-card flex items-center justify-center glow-primary">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Nog geen artikelen</h2>
              <p className="text-muted-foreground">
                Er zijn nog geen gepubliceerde blogposts. Kom binnenkort terug voor waardevolle content!
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Category Filters */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Categorieën
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <motion.button
                key={category.label}
                onClick={() => setSelectedCategory(category.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 flex items-center gap-2
                  ${selectedCategory === category.value
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-primary' 
                    : 'glass-card hover:bg-muted/50 text-foreground'
                  }
                `}
              >
                <span>{category.emoji}</span>
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Results count */}
        <motion.div 
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{posts.length}</span> artikelen gevonden
          </p>
        </motion.div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
