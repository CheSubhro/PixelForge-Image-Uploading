import ImageUploader from "@/components/images/ImageUploader";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            PixelForge
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Upload & Optimize
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Upload an image and PixelForge will create
            optimized WebP versions for thumbnails,
            cards and detailed views.
          </p>
        </div>

        <ImageUploader />
      </div>
    </main>
  );
}