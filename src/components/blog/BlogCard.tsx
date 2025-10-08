import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

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
}

export const BlogCard = ({ post }: BlogCardProps) => {
  const readingTime = post.content
    ? Math.ceil(post.content.split(" ").length / 200)
    : 5;

  return (
    <Link to={`/blog/${post.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-smooth hover-scale shadow-card hover:shadow-card-hover">
        {post.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full h-full object-cover transition-smooth group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            {post.category && <Badge variant="secondary">{post.category}</Badge>}
          </div>
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-smooth">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {post.excerpt || "Lees meer om deze interessante blog te ontdekken..."}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.display_author?.avatar_url || undefined} />
              <AvatarFallback>
                {post.display_author?.name?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {post.display_author?.name || "Anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {post.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.published_at), "d MMM yyyy", { locale: nl })}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
