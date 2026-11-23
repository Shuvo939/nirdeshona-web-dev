export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "image/heic": "heic",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
};
export const MEDIA_MAX_SIZE = 25 * 1024 * 1024;

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;

// Images are compressed in the browser and must end up ≤ 5 MB;
// videos and PDFs can't be, so they keep the larger limit.
export function maxSizeFor(contentType: string) {
  return contentType.startsWith("image/") ? IMAGE_MAX_SIZE : MEDIA_MAX_SIZE;
}
