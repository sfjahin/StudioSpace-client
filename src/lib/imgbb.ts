/**
 * Image uploads via imgbb (https://api.imgbb.com).
 *
 * Set NEXT_PUBLIC_IMGBB_API_KEY in `.env.local` (get a free key at https://api.imgbb.com).
 * The upload goes straight from the browser to imgbb and we store the returned image URL in MongoDB.
 */
const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export const MAX_IMAGE_MB = 10;

type ImgbbResponse = {
  success?: boolean;
  data?: { url?: string; display_url?: string };
  error?: { message?: string };
};

export async function uploadImage(file: File): Promise<string> {
  if (!IMGBB_KEY) {
    throw new Error(
      "Image upload isn't set up yet. Add NEXT_PUBLIC_IMGBB_API_KEY to .env.local, or paste an image link instead."
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, WebP or GIF).");
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`That image is too large. Keep it under ${MAX_IMAGE_MB} MB.`);
  }

  const body = new FormData();
  body.append("image", file);

  let res: Response;
  try {
    res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body });
  } catch {
    throw new Error("We couldn't reach the image host. Check your connection and try again.");
  }

  const json = (await res.json().catch(() => null)) as ImgbbResponse | null;
  const url = json?.data?.url ?? json?.data?.display_url;

  if (!res.ok || !json?.success || !url) {
    throw new Error(json?.error?.message ?? "The image upload failed. Please try again.");
  }
  return url;
}
