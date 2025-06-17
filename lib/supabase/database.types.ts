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
      inventories: {
        Row: {
          id: string
          name: string | null
          share_code: string | null
          created_by: string | null
          partner_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          share_code?: string | null
          created_by?: string | null
          partner_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          share_code?: string | null
          created_by?: string | null
          partner_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_members: {
        Row: {
          inventory_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          inventory_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          inventory_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      items: {
        Row: {
          id: string
          inventory_id: string
          image_url: string
          thumbnail_url: string | null
          name: string | null
          location: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inventory_id: string
          image_url: string
          thumbnail_url?: string | null
          name?: string | null
          location?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inventory_id?: string
          image_url?: string
          thumbnail_url?: string | null
          name?: string | null
          location?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          item_id: string
          user_id: string
          vote: 'keep' | 'toss' | 'maybe'
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          vote: 'keep' | 'toss' | 'maybe'
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          vote?: 'keep' | 'toss' | 'maybe'
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          inventory_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          inventory_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          inventory_id?: string
          name?: string
          created_at?: string
        }
      }
      item_tags: {
        Row: {
          item_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          item_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          item_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          item_id: string
          user_id: string
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          inventory_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          inventory_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          inventory_id?: string
          name?: string
          created_at?: string
        }
      }
    }
    Views: {
      items_with_votes: {
        Row: {
          id: string
          inventory_id: string
          image_url: string
          thumbnail_url: string | null
          name: string | null
          location: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          votes: Json
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}