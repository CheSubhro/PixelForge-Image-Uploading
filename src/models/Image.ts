import mongoose, { Schema, Model } from "mongoose";

interface IImageVersion {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface IImage {
  originalName: string;
  mimeType: string;

  original: IImageVersion;
  optimized: IImageVersion;
  thumbnail: IImageVersion;

  createdAt: Date;
  updatedAt: Date;
}

const ImageVersionSchema = new Schema<IImageVersion>(
  {
    publicId: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    bytes: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ImageSchema = new Schema<IImage>(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    original: {
      type: ImageVersionSchema,
      required: true,
    },

    optimized: {
      type: ImageVersionSchema,
      required: true,
    },

    thumbnail: {
      type: ImageVersionSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Image: Model<IImage> =
  mongoose.models.Image ||
  mongoose.model<IImage>("Image", ImageSchema);

export default Image;