import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Uploads a file into the shared `media` bucket under
 * `{businessId}/{folder}/...` and returns its public URL. RLS on
 * storage.objects checks that the caller owns the business in that
 * first path segment, so this must run with the user's own session
 * (not the service-role client).
 */
export async function uploadBusinessMedia(
  supabase: SupabaseClient<Database>,
  businessId: string,
  folder: "logo" | "staff" | "portfolio",
  file: File
) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${businessId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
