export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type NotifyChannel = "email" | "telegram";
export type TelegramLinkKind = "owner" | "client";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      businesses: Table<
        {
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          description: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          owner_id: string;
          slug: string;
          name: string;
          logo_url?: string | null;
          description?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<{
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          description: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        }>
      >;
      services: Table<
        {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        },
        {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        },
        Partial<{
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        }>
      >;
      staff: Table<
        {
          id: string;
          business_id: string;
          name: string;
          title: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_active: boolean;
          sort_order: number;
          access_token: string;
          created_at: string;
        },
        {
          id?: string;
          business_id: string;
          name: string;
          title?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          access_token?: string;
          created_at?: string;
        },
        Partial<{
          id: string;
          business_id: string;
          name: string;
          title: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_active: boolean;
          sort_order: number;
          access_token: string;
          created_at: string;
        }>
      >;
      staff_services: Table<
        { staff_id: string; service_id: string },
        { staff_id: string; service_id: string },
        Partial<{ staff_id: string; service_id: string }>
      >;
      portfolio_items: Table<
        {
          id: string;
          staff_id: string;
          image_url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        },
        {
          id?: string;
          staff_id: string;
          image_url: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        },
        Partial<{
          id: string;
          staff_id: string;
          image_url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        }>
      >;
      clients: Table<
        {
          id: string;
          business_id: string;
          name: string;
          phone: string;
          email: string | null;
          telegram_chat_id: string | null;
          visits_count: number;
          last_visit_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          business_id: string;
          name: string;
          phone: string;
          email?: string | null;
          telegram_chat_id?: string | null;
          visits_count?: number;
          last_visit_at?: string | null;
          created_at?: string;
        },
        Partial<{
          id: string;
          business_id: string;
          name: string;
          phone: string;
          email: string | null;
          telegram_chat_id: string | null;
          visits_count: number;
          last_visit_at: string | null;
          created_at: string;
        }>
      >;
      reviews: Table<
        {
          id: string;
          business_id: string;
          staff_id: string | null;
          client_name: string;
          rating: number;
          comment: string | null;
          is_published: boolean;
          created_at: string;
        },
        {
          id?: string;
          business_id: string;
          staff_id?: string | null;
          client_name: string;
          rating: number;
          comment?: string | null;
          is_published?: boolean;
          created_at?: string;
        },
        Partial<{
          id: string;
          business_id: string;
          staff_id: string | null;
          client_name: string;
          rating: number;
          comment: string | null;
          is_published: boolean;
          created_at: string;
        }>
      >;
      business_hours: Table<
        {
          id: string;
          business_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
        },
        {
          id?: string;
          business_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
        },
        Partial<{
          id: string;
          business_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
        }>
      >;
      bookings: Table<
        {
          id: string;
          business_id: string;
          service_id: string;
          staff_id: string;
          client_id: string;
          start_at: string;
          end_at: string;
          status: BookingStatus;
          notify_channel: NotifyChannel;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          business_id: string;
          service_id: string;
          staff_id: string;
          client_id: string;
          start_at: string;
          end_at: string;
          status?: BookingStatus;
          notify_channel?: NotifyChannel;
          notes?: string | null;
          created_at?: string;
        },
        Partial<{
          id: string;
          business_id: string;
          service_id: string;
          staff_id: string;
          client_id: string;
          start_at: string;
          end_at: string;
          status: BookingStatus;
          notify_channel: NotifyChannel;
          notes: string | null;
          created_at: string;
        }>
      >;
      notification_settings: Table<
        {
          business_id: string;
          email_enabled: boolean;
          telegram_enabled: boolean;
          owner_telegram_chat_id: string | null;
          updated_at: string;
        },
        {
          business_id: string;
          email_enabled?: boolean;
          telegram_enabled?: boolean;
          owner_telegram_chat_id?: string | null;
          updated_at?: string;
        },
        Partial<{
          business_id: string;
          email_enabled: boolean;
          telegram_enabled: boolean;
          owner_telegram_chat_id: string | null;
          updated_at: string;
        }>
      >;
      telegram_link_tokens: Table<
        {
          token: string;
          kind: TelegramLinkKind;
          business_id: string;
          client_id: string | null;
          consumed_at: string | null;
          created_at: string;
        },
        {
          token?: string;
          kind: TelegramLinkKind;
          business_id: string;
          client_id?: string | null;
          consumed_at?: string | null;
          created_at?: string;
        },
        Partial<{
          token: string;
          kind: TelegramLinkKind;
          business_id: string;
          client_id: string | null;
          consumed_at: string | null;
          created_at: string;
        }>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
