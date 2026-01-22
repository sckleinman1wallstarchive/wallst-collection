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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_us_content: {
        Row: {
          art_image_url: string | null
          art_title: string | null
          bio: string | null
          created_at: string
          id: string
          owner: string
          updated_at: string
        }
        Insert: {
          art_image_url?: string | null
          art_title?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          owner: string
          updated_at?: string
        }
        Update: {
          art_image_url?: string | null
          art_title?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          owner?: string
          updated_at?: string
        }
        Relationships: []
      }
      allowed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      capital_accounts: {
        Row: {
          cash_on_hand: number
          id: string
          parker_investment: number
          spencer_investment: number
          updated_at: string
        }
        Insert: {
          cash_on_hand?: number
          id?: string
          parker_investment?: number
          spencer_investment?: number
          updated_at?: string
        }
        Update: {
          cash_on_hand?: number
          id?: string
          parker_investment?: number
          spencer_investment?: number
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          instagram_handle: string | null
          name: string
          notes: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          name: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          name?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          date: string
          description: string
          id: string
          owner: Database["public"]["Enums"]["item_owner"]
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date?: string
          description: string
          id?: string
          owner?: Database["public"]["Enums"]["item_owner"]
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date?: string
          description?: string
          id?: string
          owner?: Database["public"]["Enums"]["item_owner"]
        }
        Relationships: []
      }
      goals: {
        Row: {
          art_style: string | null
          created_at: string | null
          description: string
          end_date: string | null
          goal_type: string | null
          id: string
          image_url: string | null
          is_complete: boolean | null
          metric_current: number | null
          metric_target: number | null
          metric_type: string | null
          owner: string
          start_date: string | null
          timeframe: string
          updated_at: string | null
        }
        Insert: {
          art_style?: string | null
          created_at?: string | null
          description: string
          end_date?: string | null
          goal_type?: string | null
          id?: string
          image_url?: string | null
          is_complete?: boolean | null
          metric_current?: number | null
          metric_target?: number | null
          metric_type?: string | null
          owner: string
          start_date?: string | null
          timeframe: string
          updated_at?: string | null
        }
        Update: {
          art_style?: string | null
          created_at?: string | null
          description?: string
          end_date?: string | null
          goal_type?: string | null
          id?: string
          image_url?: string | null
          is_complete?: boolean | null
          metric_current?: number | null
          metric_target?: number | null
          metric_type?: string | null
          owner?: string
          start_date?: string | null
          timeframe?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          acquisition_cost: number
          asking_price: number | null
          attention_note: string | null
          brand: string | null
          brand_category: string | null
          category: Database["public"]["Enums"]["item_category"]
          closet_display:
            | Database["public"]["Enums"]["closet_display_type"]
            | null
          created_at: string
          date_added: string | null
          date_sold: string | null
          days_held: number | null
          ever_in_convention: boolean | null
          goal_price: number | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          in_convention: boolean | null
          lowest_acceptable_price: number | null
          name: string
          notes: string | null
          paid_by: Database["public"]["Enums"]["item_owner"] | null
          platform: Database["public"]["Enums"]["platform"]
          platform_sold: Database["public"]["Enums"]["platform"] | null
          platforms: string[] | null
          priority_sale: boolean | null
          sale_price: number | null
          shopify_product_id: string | null
          size: string | null
          source: string | null
          source_platform: string | null
          status: Database["public"]["Enums"]["item_status"]
          storefront_display_order: number | null
          trade_cash_difference: number | null
          traded_for_item_id: string | null
          updated_at: string
        }
        Insert: {
          acquisition_cost?: number
          asking_price?: number | null
          attention_note?: string | null
          brand?: string | null
          brand_category?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          closet_display?:
            | Database["public"]["Enums"]["closet_display_type"]
            | null
          created_at?: string
          date_added?: string | null
          date_sold?: string | null
          days_held?: number | null
          ever_in_convention?: boolean | null
          goal_price?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          in_convention?: boolean | null
          lowest_acceptable_price?: number | null
          name: string
          notes?: string | null
          paid_by?: Database["public"]["Enums"]["item_owner"] | null
          platform?: Database["public"]["Enums"]["platform"]
          platform_sold?: Database["public"]["Enums"]["platform"] | null
          platforms?: string[] | null
          priority_sale?: boolean | null
          sale_price?: number | null
          shopify_product_id?: string | null
          size?: string | null
          source?: string | null
          source_platform?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          storefront_display_order?: number | null
          trade_cash_difference?: number | null
          traded_for_item_id?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_cost?: number
          asking_price?: number | null
          attention_note?: string | null
          brand?: string | null
          brand_category?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          closet_display?:
            | Database["public"]["Enums"]["closet_display_type"]
            | null
          created_at?: string
          date_added?: string | null
          date_sold?: string | null
          days_held?: number | null
          ever_in_convention?: boolean | null
          goal_price?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          in_convention?: boolean | null
          lowest_acceptable_price?: number | null
          name?: string
          notes?: string | null
          paid_by?: Database["public"]["Enums"]["item_owner"] | null
          platform?: Database["public"]["Enums"]["platform"]
          platform_sold?: Database["public"]["Enums"]["platform"] | null
          platforms?: string[] | null
          priority_sale?: boolean | null
          sale_price?: number | null
          shopify_product_id?: string | null
          size?: string | null
          source?: string | null
          source_platform?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          storefront_display_order?: number | null
          trade_cash_difference?: number | null
          traded_for_item_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_traded_for_item_id_fkey"
            columns: ["traded_for_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_brands: {
        Row: {
          art_image_url: string | null
          brand_name: string
          created_at: string
          display_order: number | null
          featured_item_id: string | null
          id: string
          size_preset: string | null
          updated_at: string
        }
        Insert: {
          art_image_url?: string | null
          brand_name: string
          created_at?: string
          display_order?: number | null
          featured_item_id?: string | null
          id?: string
          size_preset?: string | null
          updated_at?: string
        }
        Update: {
          art_image_url?: string | null
          brand_name?: string
          created_at?: string
          display_order?: number | null
          featured_item_id?: string | null
          id?: string
          size_preset?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storefront_brands_featured_item_id_fkey"
            columns: ["featured_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_grails: {
        Row: {
          art_image_url: string | null
          created_at: string
          id: string
          inventory_item_id: string | null
          position: number
          size_preset: string | null
          updated_at: string
        }
        Insert: {
          art_image_url?: string | null
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          position: number
          size_preset?: string | null
          updated_at?: string
        }
        Update: {
          art_image_url?: string | null
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          position?: number
          size_preset?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storefront_grails_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          reference: string | null
          type: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          reference?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          reference?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_allowed_user: { Args: never; Returns: boolean }
    }
    Enums: {
      closet_display_type: "nfs" | "dm"
      expense_category:
        | "supplies"
        | "shipping"
        | "platform-fees"
        | "other"
        | "pop-up"
        | "advertising"
        | "subscriptions"
      item_category:
        | "tops"
        | "bottoms"
        | "outerwear"
        | "footwear"
        | "accessories"
        | "bags"
        | "other"
      item_owner: "Parker Kleinman" | "Spencer Kleinman" | "Shared"
      item_status:
        | "in-closet"
        | "listed"
        | "sold"
        | "shipped"
        | "archive-hold"
        | "scammed"
        | "refunded"
        | "traded"
        | "in-closet-parker"
        | "in-closet-spencer"
        | "otw"
        | "for-sale"
      platform:
        | "grailed"
        | "depop"
        | "poshmark"
        | "ebay"
        | "vinted"
        | "mercari"
        | "trade"
        | "none"
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
      closet_display_type: ["nfs", "dm"],
      expense_category: [
        "supplies",
        "shipping",
        "platform-fees",
        "other",
        "pop-up",
        "advertising",
        "subscriptions",
      ],
      item_category: [
        "tops",
        "bottoms",
        "outerwear",
        "footwear",
        "accessories",
        "bags",
        "other",
      ],
      item_owner: ["Parker Kleinman", "Spencer Kleinman", "Shared"],
      item_status: [
        "in-closet",
        "listed",
        "sold",
        "shipped",
        "archive-hold",
        "scammed",
        "refunded",
        "traded",
        "in-closet-parker",
        "in-closet-spencer",
        "otw",
        "for-sale",
      ],
      platform: [
        "grailed",
        "depop",
        "poshmark",
        "ebay",
        "vinted",
        "mercari",
        "trade",
        "none",
      ],
    },
  },
} as const
