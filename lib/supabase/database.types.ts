export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          store_type: 'retail_store' | 'warehouse' | 'distribution_center' | 'pop_up_store'
          status: 'active' | 'inactive' | 'pending_approval' | 'suspended'
          owner_id: string
          business_name: string | null
          business_registration_number: string | null
          tax_number: string | null
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          timezone: string | null
          currency: string | null
          logo_url: string | null
          website_url: string | null
          description: string | null
          settings: Json | null
          subscription_plan: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          store_type?: 'retail_store' | 'warehouse' | 'distribution_center' | 'pop_up_store'
          status?: 'active' | 'inactive' | 'pending_approval' | 'suspended'
          owner_id: string
          business_name?: string | null
          business_registration_number?: string | null
          tax_number?: string | null
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          timezone?: string | null
          currency?: string | null
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          settings?: Json | null
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          store_type?: 'retail_store' | 'warehouse' | 'distribution_center' | 'pop_up_store'
          status?: 'active' | 'inactive' | 'pending_approval' | 'suspended'
          owner_id?: string
          business_name?: string | null
          business_registration_number?: string | null
          tax_number?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          timezone?: string | null
          currency?: string | null
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          settings?: Json | null
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_invitations: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
          store_id: string | null
          organization_id: string | null
          invited_by: string
          invitation_token: string
          status: 'pending' | 'accepted' | 'expired' | 'cancelled'
          message: string | null
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
          store_id?: string | null
          organization_id?: string | null
          invited_by: string
          invitation_token: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          message?: string | null
          expires_at: string
          accepted_at?: string | null
          accepted_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
          store_id?: string | null
          organization_id?: string | null
          invited_by?: string
          invitation_token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          message?: string | null
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      store_analytics: {
        Row: {
          id: string
          store_id: string
          date: string
          total_sales: number
          total_orders: number
          total_customers: number
          total_products: number
          low_stock_items: number
          out_of_stock_items: number
          top_selling_products: Json | null
          revenue_by_category: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          date: string
          total_sales?: number
          total_orders?: number
          total_customers?: number
          total_products?: number
          low_stock_items?: number
          out_of_stock_items?: number
          top_selling_products?: Json | null
          revenue_by_category?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          date?: string
          total_sales?: number
          total_orders?: number
          total_customers?: number
          total_products?: number
          low_stock_items?: number
          out_of_stock_items?: number
          top_selling_products?: Json | null
          revenue_by_category?: Json | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          email: string
          name: string
          role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
          avatar_url: string | null
          status: 'active' | 'inactive' | 'suspended'
          last_login_at: string | null
          is_store_owner: boolean | null
          permissions: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
           id?: string
           organization_id?: string | null
           store_id?: string | null
           email: string
           name: string
           role?: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
           avatar_url?: string | null
           status?: 'active' | 'inactive' | 'suspended'
           last_login_at?: string | null
           is_store_owner?: boolean | null
           permissions?: string[] | null
           created_at?: string
           updated_at?: string
         }
        Update: {
           id?: string
           organization_id?: string | null
           store_id?: string | null
           email?: string
           name?: string
           role?: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
           avatar_url?: string | null
           status?: 'active' | 'inactive' | 'suspended'
           last_login_at?: string | null
           is_store_owner?: boolean | null
           permissions?: string[] | null
           created_at?: string
           updated_at?: string
         }
      }
      categories: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          status: 'active' | 'inactive'
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          status?: 'active' | 'inactive'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          status?: 'active' | 'inactive'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          category_id: string | null
          name: string
          description: string | null
          sku: string
          barcode: string | null
          cost_price: number
          selling_price: number
          stock_quantity: number
          min_stock_level: number | null
          max_stock_level: number | null
          unit: string | null
          weight: number | null
          dimensions: Json | null
          images: string[] | null
          tags: string[] | null
          status: 'active' | 'inactive' | 'discontinued'
          is_trackable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          category_id?: string | null
          name: string
          description?: string | null
          sku: string
          barcode?: string | null
          cost_price: number
          selling_price: number
          stock_quantity?: number
          min_stock_level?: number | null
          max_stock_level?: number | null
          unit?: string | null
          weight?: number | null
          dimensions?: Json | null
          images?: string[] | null
          tags?: string[] | null
          status?: 'active' | 'inactive' | 'discontinued'
          is_trackable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          category_id?: string | null
          name?: string
          description?: string | null
          sku?: string
          barcode?: string | null
          cost_price?: number
          selling_price?: number
          stock_quantity?: number
          min_stock_level?: number | null
          max_stock_level?: number | null
          unit?: string | null
          weight?: number | null
          dimensions?: Json | null
          images?: string[] | null
          tags?: string[] | null
          status?: 'active' | 'inactive' | 'discontinued'
          is_trackable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: Json | null
          payment_terms: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
          payment_terms?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
          payment_terms?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          name: string
          email: string | null
          phone: string | null
          address: Json | null
          loyalty_points: number
          total_spent: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          address?: Json | null
          loyalty_points?: number
          total_spent?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          address?: Json | null
          loyalty_points?: number
          total_spent?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          customer_id: string | null
          user_id: string
          order_number: string
          status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_method: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          customer_id?: string | null
          user_id: string
          order_number: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          customer_id?: string | null
          user_id?: string
          order_number?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          product_id: string
          user_id: string
          type: 'in' | 'out' | 'adjustment' | 'transfer'
          quantity: number
          reference_id: string | null
          reference_type: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          product_id: string
          user_id: string
          type: 'in' | 'out' | 'adjustment' | 'transfer'
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          product_id?: string
          user_id?: string
          type?: 'in' | 'out' | 'adjustment' | 'transfer'
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          store_id: string | null
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          store_id?: string | null
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'enterprise'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
      user_role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
      user_status: 'active' | 'inactive' | 'suspended'
      product_status: 'active' | 'inactive' | 'discontinued'
      order_status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      stock_movement_type: 'in' | 'out' | 'adjustment' | 'transfer'
      store_type: 'retail_store' | 'warehouse' | 'distribution_center' | 'pop_up_store'
      store_status: 'active' | 'inactive' | 'pending_approval' | 'suspended'
      invitation_status: 'pending' | 'accepted' | 'expired' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}