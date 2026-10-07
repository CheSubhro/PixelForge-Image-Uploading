import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import {
  uploadBufferToCloudinary,
} from "@/lib/cloudinary";

import {
  createThumbnail,
  createOptimized,
  createDetail,
} from "@/lib/sharp";

import { validateImageFile } from "@/lib/validations/image";

import Image from "@/models/Image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required.",
        },
        { status: 400 }
      );
    }

    validateImageFile(file);

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    /*
     * Create a safe base name.
     *
     * Example:
     * IMG_20261007.jpg
     *
     * becomes:
     * IMG_20261007
     */
    const originalName = file.name;

    const baseName =
      originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase() || `image-${Date.now()}`;

    /*
     * Process images
     */

    const thumbnail = await createThumbnail(inputBuffer);

    const optimized = await createOptimized(inputBuffer);

    const detail = await createDetail(inputBuffer);

    /*
     * Upload original
     */

    const originalUpload =
      await uploadBufferToCloudinary(
        inputBuffer,
        `pixelforge/original/${baseName}`
      );

    /*
     * Upload thumbnail
     */

    const thumbnailUpload =
      await uploadBufferToCloudinary(
        thumbnail.buffer,
        `pixelforge/thumbnails/${baseName}`
      );

    /*
     * Upload optimized
     */

    const optimizedUpload =
      await uploadBufferToCloudinary(
        optimized.buffer,
        `pixelforge/optimized/${baseName}`
      );

    /*
     * Upload detail
     */

    const detailUpload =
      await uploadBufferToCloudinary(
        detail.buffer,
        `pixelforge/detail/${baseName}`
      );

    /*
     * Save metadata in MongoDB
     */

    await connectDB();

    const image = await Image.create({
      originalName,
      mimeType: file.type,

      original: originalUpload,

      thumbnail: thumbnailUpload,

      optimized: optimizedUpload,

      detail: detailUpload,
    });

    return NextResponse.json(
      {
        success: true,

        message: "Image uploaded successfully.",

        image: {
          id: image._id,

          originalName: image.originalName,

          thumbnail: image.thumbnail.secureUrl,

          optimized: image.optimized.secureUrl,

          detail: image.detail.secureUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("IMAGE_UPLOAD_ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Image upload failed.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}