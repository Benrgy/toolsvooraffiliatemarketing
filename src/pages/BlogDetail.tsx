import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { BlogSEO } from "@/components/blog/BlogSEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          display_author:display_author_id(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </article>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog post niet gevonden</h1>
          <p className="text-muted-foreground mb-6">
            De blog post die je zoekt bestaat niet of is niet gepubliceerd.
          </p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar blog
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BlogSEO post={post} />
      
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar blog
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>
            )}

            {post.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{post.category}</span>
              </div>
            )}
          </div>

          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content || ''}
          </ReactMarkdown>
        </div>

        {/* Author Info */}
        {post.display_author && (
          <footer className="mt-12 pt-8 border-t">
            <div className="flex items-start gap-4">
              {post.display_author.avatar_url && (
                <img
                  src={post.display_author.avatar_url}
                  alt={post.display_author.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-lg">{post.display_author.name}</p>
                {post.display_author.bio && (
                  <p className="text-muted-foreground mt-1">{post.display_author.bio}</p>
                )}
              </div>
            </div>
          </footer>
        )}
      </article>
    </Layout>
  );
};

export default BlogDetail;
