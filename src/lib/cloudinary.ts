import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  publicId: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            error || new Error("Cloudinary upload failed")
          );
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(
  publicId: string
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}

export default cloudinary;