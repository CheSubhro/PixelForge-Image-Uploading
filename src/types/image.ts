export interface ImageVersion {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface ImageDocument {
  originalName: string;
  mimeType: string;

  original: ImageVersion;
  optimized: ImageVersion;
  thumbnail: ImageVersion;

  createdAt: Date;
  updatedAt: Date;
}