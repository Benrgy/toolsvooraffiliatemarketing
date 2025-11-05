export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          author_schema_type: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          credentials: string | null
          email: string | null
          expertise_areas: string[] | null
          google_scholar_url: string | null
          id: string
          linkedin_url: string | null
          name: string
          twitter_handle: string | null
          twitter_url: string | null
          updated_at: string | null
          website: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          author_schema_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credentials?: string | null
          email?: string | null
          expertise_areas?: string[] | null
          google_scholar_url?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          twitter_handle?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          author_schema_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credentials?: string | null
          email?: string | null
          expertise_areas?: string[] | null
          google_scholar_url?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          twitter_handle?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      backlink_quality_history: {
        Row: {
          backlink_id: string
          checked_at: string
          domain_authority: number | null
          id: string
          relevance_score: number | null
          spam_score: number | null
          status: string
        }
        Insert: {
          backlink_id: string
          checked_at?: string
          domain_authority?: number | null
          id?: string
          relevance_score?: number | null
          spam_score?: number | null
          status: string
        }
        Update: {
          backlink_id?: string
          checked_at?: string
          domain_authority?: number | null
          id?: string
          relevance_score?: number | null
          spam_score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlink_quality_history_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks"
            referencedColumns: ["id"]
          },
        ]
      }
      backlinks: {
        Row: {
          anchor_text: string | null
          context_snippet: string | null
          created_at: string
          discovered_at: string
          domain_authority: number | null
          id: string
          last_checked_at: string
          link_type: string
          notes: string | null
          page_title: string | null
          post_id: string | null
          relevance_score: number | null
          source_domain: string
          source_url: string
          spam_score: number | null
          status: string
          traffic_estimate: number | null
          updated_at: string
        }
        Insert: {
          anchor_text?: string | null
          context_snippet?: string | null
          created_at?: string
          discovered_at?: string
          domain_authority?: number | null
          id?: string
          last_checked_at?: string
          link_type?: string
          notes?: string | null
          page_title?: string | null
          post_id?: string | null
          relevance_score?: number | null
          source_domain: string
          source_url: string
          spam_score?: number | null
          status?: string
          traffic_estimate?: number | null
          updated_at?: string
        }
        Update: {
          anchor_text?: string | null
          context_snippet?: string | null
          created_at?: string
          discovered_at?: string
          domain_authority?: number | null
          id?: string
          last_checked_at?: string
          link_type?: string
          notes?: string | null
          page_title?: string | null
          post_id?: string | null
          relevance_score?: number | null
          source_domain?: string
          source_url?: string
          spam_score?: number | null
          status?: string
          traffic_estimate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlinks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_analytics_summary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "backlinks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ga4_settings: {
        Row: {
          api_secret: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          measurement_id: string | null
          property_id: string | null
          sync_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          api_secret?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          measurement_id?: string | null
          property_id?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          api_secret?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          measurement_id?: string | null
          property_id?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      post_analytics: {
        Row: {
          avg_time_on_page: number
          backlinks_gained: number
          bounce_rate: number | null
          click_through_rate: number | null
          comments_count: number
          conversion_rate: number | null
          conversions: number
          created_at: string
          date: string
          domain_authority_score: number | null
          id: string
          keyword_rankings: Json | null
          organic_traffic: number
          page_views: number
          post_id: string
          scroll_depth: number | null
          social_shares: number
          unique_visitors: number
          updated_at: string
        }
        Insert: {
          avg_time_on_page?: number
          backlinks_gained?: number
          bounce_rate?: number | null
          click_through_rate?: number | null
          comments_count?: number
          conversion_rate?: number | null
          conversions?: number
          created_at?: string
          date?: string
          domain_authority_score?: number | null
          id?: string
          keyword_rankings?: Json | null
          organic_traffic?: number
          page_views?: number
          post_id: string
          scroll_depth?: number | null
          social_shares?: number
          unique_visitors?: number
          updated_at?: string
        }
        Update: {
          avg_time_on_page?: number
          backlinks_gained?: number
          bounce_rate?: number | null
          click_through_rate?: number | null
          comments_count?: number
          conversion_rate?: number | null
          conversions?: number
          created_at?: string
          date?: string
          domain_authority_score?: number | null
          id?: string
          keyword_rankings?: Json | null
          organic_traffic?: number
          page_views?: number
          post_id?: string
          scroll_depth?: number | null
          social_shares?: number
          unique_visitors?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_analytics_summary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          ai_overview_optimized: boolean | null
          article_tags: string[] | null
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          display_author_id: string | null
          excerpt: string | null
          expert_reviewed: boolean | null
          external_links_count: number | null
          fact_checked: boolean | null
          featured: boolean | null
          featured_image: string | null
          featured_image_alt: string | null
          featured_image_caption: string | null
          featured_image_format: string | null
          featured_image_height: number | null
          featured_image_size_kb: number | null
          featured_image_title: string | null
          featured_image_width: number | null
          featured_snippet_target: string | null
          focus_keyword: string | null
          geo_target_country: string | null
          geo_target_language: string | null
          geo_target_region: string | null
          id: string
          internal_links_count: number | null
          last_reviewed_at: string | null
          linkedin_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          people_also_ask: string[] | null
          pinterest_description: string | null
          published_at: string | null
          readability_score: number | null
          review_count: number | null
          review_rating: number | null
          schema_type: string | null
          secondary_keywords: string[] | null
          seo_score: number | null
          slug: string
          status: string | null
          title: string
          twitter_card_type: string | null
          updated_at: string | null
          video_description: string | null
          video_duration: string | null
          video_thumbnail_url: string | null
          video_upload_date: string | null
          video_url: string | null
          word_count: number | null
        }
        Insert: {
          ai_overview_optimized?: boolean | null
          article_tags?: string[] | null
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          display_author_id?: string | null
          excerpt?: string | null
          expert_reviewed?: boolean | null
          external_links_count?: number | null
          fact_checked?: boolean | null
          featured?: boolean | null
          featured_image?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          featured_image_format?: string | null
          featured_image_height?: number | null
          featured_image_size_kb?: number | null
          featured_image_title?: string | null
          featured_image_width?: number | null
          featured_snippet_target?: string | null
          focus_keyword?: string | null
          geo_target_country?: string | null
          geo_target_language?: string | null
          geo_target_region?: string | null
          id?: string
          internal_links_count?: number | null
          last_reviewed_at?: string | null
          linkedin_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          people_also_ask?: string[] | null
          pinterest_description?: string | null
          published_at?: string | null
          readability_score?: number | null
          review_count?: number | null
          review_rating?: number | null
          schema_type?: string | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug: string
          status?: string | null
          title: string
          twitter_card_type?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_duration?: string | null
          video_thumbnail_url?: string | null
          video_upload_date?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Update: {
          ai_overview_optimized?: boolean | null
          article_tags?: string[] | null
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          display_author_id?: string | null
          excerpt?: string | null
          expert_reviewed?: boolean | null
          external_links_count?: number | null
          fact_checked?: boolean | null
          featured?: boolean | null
          featured_image?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          featured_image_format?: string | null
          featured_image_height?: number | null
          featured_image_size_kb?: number | null
          featured_image_title?: string | null
          featured_image_width?: number | null
          featured_snippet_target?: string | null
          focus_keyword?: string | null
          geo_target_country?: string | null
          geo_target_language?: string | null
          geo_target_region?: string | null
          id?: string
          internal_links_count?: number | null
          last_reviewed_at?: string | null
          linkedin_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          people_also_ask?: string[] | null
          pinterest_description?: string | null
          published_at?: string | null
          readability_score?: number | null
          review_count?: number | null
          review_rating?: number | null
          schema_type?: string | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug?: string
          status?: string | null
          title?: string
          twitter_card_type?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_duration?: string | null
          video_thumbnail_url?: string | null
          video_upload_date?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_display_author_id_fkey"
            columns: ["display_author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_display_author_id_fkey"
            columns: ["display_author_id"]
            isOneToOne: false
            referencedRelation: "authors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tool_features: {
        Row: {
          created_at: string
          feature: string
          id: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          tool_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_features_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          tool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_tags_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          affiliate_link: string | null
          category_id: string | null
          created_at: string
          description: string
          featured: boolean | null
          focus_keyword: string | null
          geo_target_country: string | null
          id: string
          logo_url: string | null
          meta_keywords: string[] | null
          name: string
          pricing_model: string | null
          published_at: string | null
          schema_price_range: string | null
          schema_rating: number | null
          schema_review_count: number | null
          secondary_keywords: string[] | null
          seo_score: number | null
          slug: string
          status: string | null
          tagline: string
          updated_at: string
          upvotes: number | null
          website_url: string
        }
        Insert: {
          affiliate_link?: string | null
          category_id?: string | null
          created_at?: string
          description: string
          featured?: boolean | null
          focus_keyword?: string | null
          geo_target_country?: string | null
          id?: string
          logo_url?: string | null
          meta_keywords?: string[] | null
          name: string
          pricing_model?: string | null
          published_at?: string | null
          schema_price_range?: string | null
          schema_rating?: number | null
          schema_review_count?: number | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug: string
          status?: string | null
          tagline: string
          updated_at?: string
          upvotes?: number | null
          website_url: string
        }
        Update: {
          affiliate_link?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean | null
          focus_keyword?: string | null
          geo_target_country?: string | null
          id?: string
          logo_url?: string | null
          meta_keywords?: string[] | null
          name?: string
          pricing_model?: string | null
          published_at?: string | null
          schema_price_range?: string | null
          schema_rating?: number | null
          schema_review_count?: number | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug?: string
          status?: string | null
          tagline?: string
          updated_at?: string
          upvotes?: number | null
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      authors_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      post_analytics_summary: {
        Row: {
          avg_bounce_rate: number | null
          avg_conversion_rate: number | null
          avg_scroll_depth: number | null
          avg_time_on_page: number | null
          days_tracked: number | null
          post_id: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          title: string | null
          total_conversions: number | null
          total_organic_traffic: number | null
          total_shares: number | null
          total_views: number | null
          total_visitors: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
