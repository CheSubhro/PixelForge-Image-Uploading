import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
  CloudinaryUploadResult,
} from "@/lib/cloudinary";

import {
  createThumbnail,
  createOptimized,
  createDetail,
} from "@/lib/sharp";

import { validateImageFile } from "@/lib/validations/image";

import { connectDB } from "@/lib/mongodb";

import Image from "@/models/Image";

import crypto from "crypto";

interface ProcessImageInput {
  file: File;
}

interface ProcessImageResult {
  id: string;
  originalName: string;

  thumbnail: CloudinaryUploadResult;
  optimized: CloudinaryUploadResult;
  detail: CloudinaryUploadResult;
}

function createBaseName(fileName: string): string {
  const nameWithoutExtension = fileName.replace(
    /\.[^/.]+$/,
    ""
  );

  const sanitizedName = nameWithoutExtension
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const uniqueId = crypto.randomUUID();

  return `${sanitizedName || "image"}-${uniqueId}`;
}

async function cleanupCloudinaryFiles(
  uploads: CloudinaryUploadResult[]
) {
  await Promise.allSettled(
    uploads.map((upload) =>
      deleteFromCloudinary(upload.publicId)
    )
  );
}

export async function processImage({
  file,
}: ProcessImageInput): Promise<ProcessImageResult> {
  validateImageFile(file);

  const inputBuffer = Buffer.from(
    await file.arrayBuffer()
  );

  const baseName = createBaseName(file.name);

  const uploadedFiles: CloudinaryUploadResult[] = [];

  try {
    /*
     * --------------------------------
     * 1. Sharp processing
     * --------------------------------
     */

    const thumbnail = await createThumbnail(
      inputBuffer
    );

    const optimized = await createOptimized(
      inputBuffer
    );

    const detail = await createDetail(inputBuffer);

    /*
     * --------------------------------
     * 2. Upload original
     * --------------------------------
     */

    const originalUpload =
      await uploadBufferToCloudinary(
        inputBuffer,
        `pixelforge/original/${baseName}`
      );

    uploadedFiles.push(originalUpload);

    /*
     * --------------------------------
     * 3. Upload thumbnail
     * --------------------------------
     */

    const thumbnailUpload =
      await uploadBufferToCloudinary(
        thumbnail.buffer,
        `pixelforge/thumbnails/${baseName}`
      );

    uploadedFiles.push(thumbnailUpload);

    /*
     * --------------------------------
     * 4. Upload optimized
     * --------------------------------
     */

    const optimizedUpload =
      await uploadBufferToCloudinary(
        optimized.buffer,
        `pixelforge/optimized/${baseName}`
      );

    uploadedFiles.push(optimizedUpload);

    /*
     * --------------------------------
     * 5. Upload detail
     * --------------------------------
     */

    const detailUpload =
      await uploadBufferToCloudinary(
        detail.buffer,
        `pixelforge/detail/${baseName}`
      );

    uploadedFiles.push(detailUpload);

    /*
     * --------------------------------
     * 6. MongoDB
     * --------------------------------
     */

    await connectDB();

    const image = await Image.create({
      originalName: file.name,
      mimeType: file.type,

      original: originalUpload,

      thumbnail: thumbnailUpload,

      optimized: optimizedUpload,

      detail: detailUpload,
    });

    /*
     * --------------------------------
     * 7. Return only frontend-safe data
     * --------------------------------
     */

    return {
      id: image._id.toString(),

      originalName: image.originalName,

      thumbnail: thumbnailUpload,

      optimized: optimizedUpload,

      detail: detailUpload,
    };
  } catch (error) {
    /*
     * If anything fails after Cloudinary upload,
     * remove already uploaded files.
     */

    await cleanupCloudinaryFiles(uploadedFiles);

    throw error;
  }
}