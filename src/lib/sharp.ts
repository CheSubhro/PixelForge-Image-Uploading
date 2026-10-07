import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: "webp";
  size: number;
}

async function createWebp(
  input: Buffer,
  width: number
): Promise<ProcessedImage> {
  const result = await sharp(input)
    .resize({
      width,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: 82,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    format: "webp",
    size: result.data.length,
  };
}

export async function createThumbnail(
  input: Buffer
): Promise<ProcessedImage> {
  return createWebp(input, 300);
}

export async function createOptimized(
  input: Buffer
): Promise<ProcessedImage> {
  return createWebp(input, 800);
}

export async function createDetail(
  input: Buffer
): Promise<ProcessedImage> {
  return createWebp(input, 1600);
}