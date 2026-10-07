const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateImageFile(file: File) {
  if (!file) {
    throw new Error("No image file provided");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid image format. Only JPEG, PNG and WebP are supported."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image size must be less than 10MB.");
  }

  return true;
}