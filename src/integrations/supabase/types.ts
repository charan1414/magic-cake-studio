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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addons: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          created_at: string
          full_name: string | null
          id: string
          is_default: boolean
          label: string
          lat: number | null
          line1: string
          line2: string | null
          lng: number | null
          phone: string | null
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          city?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_default?: boolean
          label?: string
          lat?: number | null
          line1: string
          line2?: string | null
          lng?: number | null
          phone?: string | null
          pincode: string
          state?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_default?: boolean
          label?: string
          lat?: number | null
          line1?: string
          line2?: string | null
          lng?: number | null
          phone?: string | null
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      cake_designs: {
        Row: {
          config: Json
          created_at: string
          delivery_date: string | null
          design_code: string
          estimated_price: number | null
          id: string
          message: string | null
          notes: string | null
          reference_image_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          delivery_date?: string | null
          design_code?: string
          estimated_price?: number | null
          id?: string
          message?: string | null
          notes?: string | null
          reference_image_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          delivery_date?: string | null
          design_code?: string
          estimated_price?: number | null
          id?: string
          message?: string | null
          notes?: string | null
          reference_image_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          allow_gps_checkout: boolean
          base_delivery_fee: number
          business_address: string
          business_lat: number
          business_lng: number
          created_at: string
          delivery_enabled: boolean
          delivery_radius_km: number
          distance_mode: string
          free_delivery_threshold: number
          id: string
          min_order_amount: number
          per_km_fee: number
          require_complete_address: boolean
          serviceable_pincodes: string[]
          singleton: boolean
          updated_at: string
        }
        Insert: {
          allow_gps_checkout?: boolean
          base_delivery_fee?: number
          business_address?: string
          business_lat?: number
          business_lng?: number
          created_at?: string
          delivery_enabled?: boolean
          delivery_radius_km?: number
          distance_mode?: string
          free_delivery_threshold?: number
          id?: string
          min_order_amount?: number
          per_km_fee?: number
          require_complete_address?: boolean
          serviceable_pincodes?: string[]
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          allow_gps_checkout?: boolean
          base_delivery_fee?: number
          business_address?: string
          business_lat?: number
          business_lng?: number
          created_at?: string
          delivery_enabled?: boolean
          delivery_radius_km?: number
          distance_mode?: string
          free_delivery_threshold?: number
          id?: string
          min_order_amount?: number
          per_km_fee?: number
          require_complete_address?: boolean
          serviceable_pincodes?: string[]
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      founder_profile: {
        Row: {
          bio: string
          company: string
          designation: string
          founded: string
          id: boolean
          instagram_url: string | null
          linkedin_url: string | null
          location: string
          mission: string
          name: string
          photo_url: string | null
          timeline: Json
          updated_at: string
          vision: string
        }
        Insert: {
          bio?: string
          company?: string
          designation?: string
          founded?: string
          id?: boolean
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string
          mission?: string
          name?: string
          photo_url?: string | null
          timeline?: Json
          updated_at?: string
          vision?: string
        }
        Update: {
          bio?: string
          company?: string
          designation?: string
          founded?: string
          id?: boolean
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string
          mission?: string
          name?: string
          photo_url?: string | null
          timeline?: Json
          updated_at?: string
          vision?: string
        }
        Relationships: []
      }
      healthy_products: {
        Row: {
          badges: string[]
          created_at: string
          description: string
          discount_ends_at: string | null
          discount_percent: number
          discount_starts_at: string | null
          display_order: number
          enabled: boolean
          id: string
          image_url: string | null
          name: string
          price: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          badges?: string[]
          created_at?: string
          description?: string
          discount_ends_at?: string | null
          discount_percent?: number
          discount_starts_at?: string | null
          display_order?: number
          enabled?: boolean
          id?: string
          image_url?: string | null
          name: string
          price?: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          badges?: string[]
          created_at?: string
          description?: string
          discount_ends_at?: string | null
          discount_percent?: number
          discount_starts_at?: string | null
          display_order?: number
          enabled?: boolean
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      healthy_settings: {
        Row: {
          id: boolean
          ingredients: Json
          ingredients_title: string
          nutrition: Json
          nutrition_title: string
          process: Json
          process_title: string
          sort_mode: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          ingredients?: Json
          ingredients_title?: string
          nutrition?: Json
          nutrition_title?: string
          process?: Json
          process_title?: string
          sort_mode?: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          ingredients?: Json
          ingredients_title?: string
          nutrition?: Json
          nutrition_title?: string
          process?: Json
          process_title?: string
          sort_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          error: string | null
          event: string
          id: string
          order_id: string | null
          payload: Json | null
          recipient: string
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          error?: string | null
          event: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          recipient: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          error?: string | null
          event?: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          recipient?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notify_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          notified_at: string | null
          phone: string | null
          product_name: string | null
          slug: string
          source: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          notified_at?: string | null
          phone?: string | null
          product_name?: string | null
          slug: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          notified_at?: string | null
          phone?: string | null
          product_name?: string | null
          slug?: string
          source?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          categories: string[]
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          min_items: number
          offer_type: string
          product_slugs: string[]
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          categories?: string[]
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          min_items?: number
          offer_type?: string
          product_slugs?: string[]
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          categories?: string[]
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          min_items?: number
          offer_type?: string
          product_slugs?: string[]
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          order_id: string
          price: number
          qty: number
          slug: string
          variant: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          name: string
          order_id: string
          price: number
          qty: number
          slug: string
          variant?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          order_id?: string
          price?: number
          qty?: number
          slug?: string
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          delivery_distance_km: number | null
          delivery_distance_method: string | null
          delivery_fee: number
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_matched_address: string | null
          delivery_road_distance_km: number | null
          delivery_type: string
          discount: number
          discount_label: string | null
          eta_minutes: number | null
          id: string
          inventory_decremented_at: string | null
          notes: string | null
          order_code: string
          payment_method: string
          payment_status: string
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
          voucher_code: string | null
          voucher_discount: number
        }
        Insert: {
          address?: Json | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_distance_km?: number | null
          delivery_distance_method?: string | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_matched_address?: string | null
          delivery_road_distance_km?: number | null
          delivery_type?: string
          discount?: number
          discount_label?: string | null
          eta_minutes?: number | null
          id?: string
          inventory_decremented_at?: string | null
          notes?: string | null
          order_code?: string
          payment_method?: string
          payment_status?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id: string
          voucher_code?: string | null
          voucher_discount?: number
        }
        Update: {
          address?: Json | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_distance_km?: number | null
          delivery_distance_method?: string | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_matched_address?: string | null
          delivery_road_distance_km?: number | null
          delivery_type?: string
          discount?: number
          discount_label?: string | null
          eta_minutes?: number | null
          id?: string
          inventory_decremented_at?: string | null
          notes?: string | null
          order_code?: string
          payment_method?: string
          payment_status?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
          voucher_code?: string | null
          voucher_discount?: number
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          name: string | null
          new_discount: number | null
          new_price: number | null
          previous_discount: number | null
          previous_price: number | null
          slug: string
          source: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          name?: string | null
          new_discount?: number | null
          new_price?: number | null
          previous_discount?: number | null
          previous_price?: number | null
          slug: string
          source?: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          name?: string | null
          new_discount?: number | null
          new_price?: number | null
          previous_discount?: number | null
          previous_price?: number | null
          slug?: string
          source?: string
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          active: boolean
          created_at: string
          low_stock_threshold: number
          quantity_remaining: number
          slug: string
          stock_status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          low_stock_threshold?: number
          quantity_remaining?: number
          slug: string
          stock_status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          low_stock_threshold?: number
          quantity_remaining?: number
          slug?: string
          stock_status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_overrides: {
        Row: {
          availability: string
          category: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          display_order: number
          highlighted: boolean
          image: string | null
          labels: string[]
          mrp: number | null
          name: string | null
          pinned: boolean
          price: number | null
          sku: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string
          category?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          display_order?: number
          highlighted?: boolean
          image?: string | null
          labels?: string[]
          mrp?: number | null
          name?: string | null
          pinned?: boolean
          price?: number | null
          sku?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string
          category?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          display_order?: number
          highlighted?: boolean
          image?: string | null
          labels?: string[]
          mrp?: number | null
          name?: string | null
          pinned?: boolean
          price?: number | null
          sku?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          created_at: string
          first_order_discount_percent: number
          first_order_discount_used: boolean
          full_name: string | null
          id: string
          loyalty_points: number
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          first_order_discount_percent?: number
          first_order_discount_used?: boolean
          full_name?: string | null
          id: string
          loyalty_points?: number
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          first_order_discount_percent?: number
          first_order_discount_used?: boolean
          full_name?: string | null
          id?: string
          loyalty_points?: number
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_rules: {
        Row: {
          active: boolean
          created_at: string
          id: string
          priority: number
          recommend_categories: string[]
          recommend_slugs: string[]
          trigger_category: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          priority?: number
          recommend_categories?: string[]
          recommend_slugs?: string[]
          trigger_category: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          priority?: number
          recommend_categories?: string[]
          recommend_slugs?: string[]
          trigger_category?: string
        }
        Relationships: []
      }
      serviceable_pincodes: {
        Row: {
          active: boolean
          created_at: string
          delivery_fee_override: number | null
          distance_km: number
          district: string
          pincode: string
          sample_areas: string
          state: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          delivery_fee_override?: number | null
          distance_km?: number
          district?: string
          pincode: string
          sample_areas?: string
          state?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          delivery_fee_override?: number | null
          distance_km?: number
          district?: string
          pincode?: string
          sample_areas?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      signup_leads: {
        Row: {
          created_at: string
          discount_percent: number
          email: string | null
          id: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          email?: string | null
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_percent?: number
          email?: string | null
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      upsell_items: {
        Row: {
          active: boolean
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          priority: number
          promo_price: number | null
          slug: string
          starts_at: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          priority?: number
          promo_price?: number | null
          slug: string
          starts_at?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          priority?: number
          promo_price?: number | null
          slug?: string
          starts_at?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      upsell_settings: {
        Row: {
          enabled: boolean
          id: boolean
          layout: string
          max_items: number
          section_title: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: boolean
          layout?: string
          max_items?: number
          section_title?: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: boolean
          layout?: string
          max_items?: number
          section_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voucher_redemptions: {
        Row: {
          code: string
          created_at: string
          discount: number
          id: string
          order_id: string | null
          user_id: string
          voucher_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount?: number
          id?: string
          order_id?: string | null
          user_id: string
          voucher_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount?: number
          id?: string
          order_id?: string | null
          user_id?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voucher_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_redemptions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          active: boolean
          categories: string[]
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_discount: number | null
          min_order: number
          per_user_limit: number
          product_slugs: string[]
          show_publicly: boolean
          starts_at: string | null
          title: string
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          categories?: string[]
          code: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_discount?: number | null
          min_order?: number
          per_user_limit?: number
          product_slugs?: string[]
          show_publicly?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          categories?: string[]
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_discount?: number | null
          min_order?: number
          per_user_limit?: number
          product_slugs?: string[]
          show_publicly?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_slug?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_voucher: {
        Args: {
          _categories: string[]
          _code: string
          _slugs: string[]
          _subtotal: number
          _user_id: string
        }
        Returns: {
          code: string
          discount: number
          message: string
          ok: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff", "customer"],
    },
  },
} as const
