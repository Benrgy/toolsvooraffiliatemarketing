import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  title: string;
  content: string;
  featuredImage?: string;
  excerpt?: string;
}

export const ContentPreview = ({ title, content, featuredImage, excerpt }: Props) => {
  return (
    <Card className="h-full border-l-0 rounded-l-none">
      <div className="border-b px-4 py-3 bg-muted/30">
        <h3 className="font-semibold text-sm">Live Preview</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Featured Image */}
          {featuredImage && (
            <div className="mb-6">
              <img
                src={featuredImage}
                alt={title}
                className="w-full rounded-lg object-cover max-h-96"
              />
            </div>
          )}

          {/* Title */}
          {title && (
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              {title}
            </h1>
          )}

          {/* Excerpt */}
          {excerpt && (
            <p className="text-lg text-muted-foreground mb-6 italic">
              {excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg prose-img:shadow-md
              prose-figure:my-6
              prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-foreground
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
              [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:shadow-md
              [&_.video-container]:my-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Empty state */}
          {!content && !title && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Begin met typen om de preview te zien...</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
