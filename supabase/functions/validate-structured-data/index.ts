import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  path?: string;
}

interface ValidationResult {
  valid: boolean;
  schemaType: string;
  issues: ValidationIssue[];
  score: number;
}

function validateBlogPosting(schema: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Required fields
  if (!schema.headline) {
    issues.push({ type: 'error', field: 'headline', message: 'Headline is verplicht voor BlogPosting' });
  } else if (schema.headline.length > 110) {
    issues.push({ type: 'warning', field: 'headline', message: 'Headline is te lang (max 110 karakters)' });
  }

  if (!schema.image || (Array.isArray(schema.image) && schema.image.length === 0)) {
    issues.push({ type: 'error', field: 'image', message: 'Minimaal 1 afbeelding is verplicht' });
  } else {
    const images = Array.isArray(schema.image) ? schema.image : [schema.image];
    images.forEach((img: string, i: number) => {
      if (!img.startsWith('http')) {
        issues.push({ type: 'error', field: 'image', message: `Afbeelding ${i + 1} moet een volledige URL zijn` });
      }
    });
  }

  if (!schema.datePublished) {
    issues.push({ type: 'error', field: 'datePublished', message: 'Publicatiedatum is verplicht' });
  }

  if (!schema.dateModified) {
    issues.push({ type: 'warning', field: 'dateModified', message: 'Laatste wijzigingsdatum wordt aanbevolen' });
  }

  if (!schema.author) {
    issues.push({ type: 'error', field: 'author', message: 'Auteur informatie is verplicht' });
  } else {
    if (!schema.author.name) {
      issues.push({ type: 'error', field: 'author.name', message: 'Auteur naam is verplicht' });
    }
    if (!schema.author.url && !schema.author.sameAs) {
      issues.push({ type: 'warning', field: 'author', message: 'Auteur URL of sameAs wordt aanbevolen voor E-E-A-T' });
    }
  }

  if (!schema.publisher) {
    issues.push({ type: 'error', field: 'publisher', message: 'Publisher is verplicht' });
  } else {
    if (!schema.publisher.name) {
      issues.push({ type: 'error', field: 'publisher.name', message: 'Publisher naam is verplicht' });
    }
    if (!schema.publisher.logo) {
      issues.push({ type: 'error', field: 'publisher.logo', message: 'Publisher logo is verplicht' });
    }
  }

  // Recommended fields
  if (!schema.description) {
    issues.push({ type: 'warning', field: 'description', message: 'Beschrijving wordt sterk aanbevolen' });
  }

  if (!schema.mainEntityOfPage) {
    issues.push({ type: 'info', field: 'mainEntityOfPage', message: 'mainEntityOfPage helpt Google de pagina beter te begrijpen' });
  }

  return issues;
}

function validateArticle(schema: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Similar to BlogPosting but with different requirements
  if (!schema.headline) {
    issues.push({ type: 'error', field: 'headline', message: 'Headline is verplicht voor Article' });
  }

  if (!schema.image) {
    issues.push({ type: 'error', field: 'image', message: 'Afbeelding is verplicht' });
  }

  if (!schema.datePublished) {
    issues.push({ type: 'error', field: 'datePublished', message: 'Publicatiedatum is verplicht' });
  }

  if (!schema.author) {
    issues.push({ type: 'error', field: 'author', message: 'Auteur is verplicht' });
  }

  return issues;
}

function validateVideoObject(schema: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!schema.name) {
    issues.push({ type: 'error', field: 'name', message: 'Video naam is verplicht' });
  }

  if (!schema.description) {
    issues.push({ type: 'error', field: 'description', message: 'Video beschrijving is verplicht' });
  }

  if (!schema.thumbnailUrl) {
    issues.push({ type: 'error', field: 'thumbnailUrl', message: 'Thumbnail URL is verplicht' });
  } else if (Array.isArray(schema.thumbnailUrl)) {
    if (schema.thumbnailUrl.length === 0) {
      issues.push({ type: 'error', field: 'thumbnailUrl', message: 'Minimaal 1 thumbnail is verplicht' });
    }
  }

  if (!schema.uploadDate) {
    issues.push({ type: 'error', field: 'uploadDate', message: 'Upload datum is verplicht' });
  }

  if (!schema.contentUrl && !schema.embedUrl) {
    issues.push({ type: 'error', field: 'contentUrl/embedUrl', message: 'contentUrl of embedUrl is verplicht' });
  }

  if (schema.duration) {
    if (!schema.duration.match(/^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$/)) {
      issues.push({ type: 'error', field: 'duration', message: 'Duration moet in ISO 8601 format (PT1H30M)' });
    }
  }

  return issues;
}

function validateReview(schema: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!schema.reviewRating) {
    issues.push({ type: 'error', field: 'reviewRating', message: 'Review rating is verplicht' });
  } else {
    if (!schema.reviewRating.ratingValue) {
      issues.push({ type: 'error', field: 'reviewRating.ratingValue', message: 'Rating waarde is verplicht' });
    }
    if (!schema.reviewRating.bestRating) {
      issues.push({ type: 'warning', field: 'reviewRating.bestRating', message: 'Best rating wordt aanbevolen (meestal 5)' });
    }
  }

  if (!schema.author) {
    issues.push({ type: 'error', field: 'author', message: 'Review auteur is verplicht' });
  }

  if (!schema.itemReviewed) {
    issues.push({ type: 'error', field: 'itemReviewed', message: 'itemReviewed is verplicht voor Review' });
  }

  return issues;
}

function validateFAQPage(schema: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    issues.push({ type: 'error', field: 'mainEntity', message: 'mainEntity array met vragen is verplicht' });
    return issues;
  }

  if (schema.mainEntity.length < 2) {
    issues.push({ type: 'warning', field: 'mainEntity', message: 'Minimaal 2 vragen wordt aanbevolen voor FAQ' });
  }

  schema.mainEntity.forEach((question: any, i: number) => {
    if (question['@type'] !== 'Question') {
      issues.push({ type: 'error', field: `mainEntity[${i}]`, message: '@type moet "Question" zijn' });
    }
    if (!question.name) {
      issues.push({ type: 'error', field: `mainEntity[${i}].name`, message: 'Vraag tekst (name) is verplicht' });
    }
    if (!question.acceptedAnswer) {
      issues.push({ type: 'error', field: `mainEntity[${i}].acceptedAnswer`, message: 'Antwoord is verplicht' });
    } else {
      if (!question.acceptedAnswer.text && !question.acceptedAnswer.text) {
        issues.push({ type: 'error', field: `mainEntity[${i}].acceptedAnswer`, message: 'Antwoord tekst is verplicht' });
      }
    }
  });

  return issues;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schema } = await req.json();

    if (!schema) {
      return new Response(
        JSON.stringify({ error: 'Schema is verplicht' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validating schema:', schema['@type']);

    const issues: ValidationIssue[] = [];
    const schemaType = schema['@type'];

    // Validate @context
    if (!schema['@context']) {
      issues.push({ type: 'error', field: '@context', message: '@context is verplicht (https://schema.org)' });
    } else if (schema['@context'] !== 'https://schema.org') {
      issues.push({ type: 'warning', field: '@context', message: '@context moet https://schema.org zijn' });
    }

    // Validate @type
    if (!schema['@type']) {
      issues.push({ type: 'error', field: '@type', message: '@type is verplicht' });
    }

    // Type-specific validation
    switch (schemaType) {
      case 'BlogPosting':
        issues.push(...validateBlogPosting(schema));
        break;
      case 'Article':
      case 'NewsArticle':
      case 'TechArticle':
        issues.push(...validateArticle(schema));
        break;
      case 'VideoObject':
        issues.push(...validateVideoObject(schema));
        break;
      case 'Review':
        issues.push(...validateReview(schema));
        break;
      case 'FAQPage':
        issues.push(...validateFAQPage(schema));
        break;
      default:
        issues.push({ type: 'warning', field: '@type', message: `Schema type "${schemaType}" wordt niet volledig gevalideerd` });
    }

    // Calculate score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));

    const result: ValidationResult = {
      valid: errorCount === 0,
      schemaType,
      issues,
      score
    };

    console.log(`Validation complete: ${result.valid ? 'VALID' : 'INVALID'}, Score: ${score}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-structured-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
