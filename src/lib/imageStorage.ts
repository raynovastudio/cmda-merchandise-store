import { supabase } from "./supabase";

const BUCKET = "product-images";

export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const pathStart = urlObj.pathname.indexOf(`${BUCKET}/`) + BUCKET.length + 1;
    const filePath = decodeURIComponent(urlObj.pathname.slice(pathStart));
    if (filePath) {
      await supabase.storage.from(BUCKET).remove([filePath]);
    }
  } catch {
    // URL might be a data URL or invalid — silently ignore
  }
}
