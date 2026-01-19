import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowUpRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { motion } from "framer-motion";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    slug: string;
    category: string | null;
    published_at: string | null;
    featured_image: string | null;
    featured_image_alt: string | null;
    content: string | null;
    display_author?: {
      name: string;
      avatar_url: string | null;
    } | null;
  };
  index?: number;
}

export const BlogCard = ({ post, index = 0 }: BlogCardProps) => {
  const readingTime = post.content
    ? Math.ceil(post.content.split(" ").length / 200)
    : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/blog/${post.slug}`} className="group block h-full">
        <div className="relative h-full glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-elevated glow-primary-hover border-glow">
          {/* Image Container */}
          <div className="relative aspect-video overflow-hidden">
            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.featured_image_alt || post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/40" />
              </div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Category badge */}
            {post.category && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-none">
                  {post.category}
                </Badge>
              </div>
            )}
            
            {/* Reading time */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium">
                <Clock className="h-3 w-3" />
                {readingTime} min
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 flex items-start gap-2">
              <span className="flex-1">{post.title}</span>
              <ArrowUpRight className="h-5 w-5 flex-shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
            </h3>
            
            {/* Excerpt */}
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
              {post.excerpt || "Ontdek deze interessante blog over affiliate marketing strategieën..."}
            </p>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarImage src={post.display_author?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm">
                    {post.display_author?.name?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {post.display_author?.name || "Redactie"}
                  </span>
                  {post.published_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.published_at), "d MMM yyyy", { locale: nl })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom hover bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </Link>
    </motion.div>
  );
};
