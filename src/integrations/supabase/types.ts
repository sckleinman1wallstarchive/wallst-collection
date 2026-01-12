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
      inventory_items: {
        Row: {
          acquisition_cost: number
          asking_price: number | null
          brand: string | null
          category: Database["public"]["Enums"]["item_category"]
          created_at: string
          date_added: string | null
          date_sold: string | null
          days_held: number | null
          ever_in_convention: boolean | null
          goal_price: number | null
          id: string
          image_url: string | null
          in_convention: boolean | null
          lowest_acceptable_price: number | null
          name: string
          notes: string | null
          paid_by: Database["public"]["Enums"]["item_owner"] | null
          platform: Database["public"]["Enums"]["platform"]
          platform_sold: Database["public"]["Enums"]["platform"] | null
          platforms: string[] | null
          sale_price: number | null
          size: string | null
          source: string | null
          source_platform: string | null
          status: Database["public"]["Enums"]["item_status"]
          trade_cash_difference: number | null
          traded_for_item_id: string | null
          updated_at: string
        }
        Insert: {
          acquisition_cost?: number
          asking_price?: number | null
          brand?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          date_added?: string | null
          date_sold?: string | null
          days_held?: number | null
          ever_in_convention?: boolean | null
          goal_price?: number | null
          id?: string
          image_url?: string | null
          in_convention?: boolean | null
          lowest_acceptable_price?: number | null
          name: string
          notes?: string | null
          paid_by?: Database["public"]["Enums"]["item_owner"] | null
          platform?: Database["public"]["Enums"]["platform"]
          platform_sold?: Database["public"]["Enums"]["platform"] | null
          platforms?: string[] | null
          sale_price?: number | null
          size?: string | null
          source?: string | null
          source_platform?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          trade_cash_difference?: number | null
          traded_for_item_id?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_cost?: number
          asking_price?: number | null
          brand?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          date_added?: string | null
          date_sold?: string | null
          days_held?: number | null
          ever_in_convention?: boolean | null
          goal_price?: number | null
          id?: string
          image_url?: string | null
          in_convention?: boolean | null
          lowest_acceptable_price?: number | null
          name?: string
          notes?: string | null
          paid_by?: Database["public"]["Enums"]["item_owner"] | null
          platform?: Database["public"]["Enums"]["platform"]
          platform_sold?: Database["public"]["Enums"]["platform"] | null
          platforms?: string[] | null
          sale_price?: number | null
          size?: string | null
          source?: string | null
          source_platform?: string | null
          status?: Database["public"]["Enums"]["item_status"]
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
      expense_category: "supplies" | "shipping" | "platform-fees" | "other"
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
      expense_category: ["supplies", "shipping", "platform-fees", "other"],
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
