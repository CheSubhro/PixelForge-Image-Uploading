import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-2xl text-center">
        <p className="text-sm font-semibold text-gray-500">
          PixelForge
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Optimize your images effortlessly.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600">
          Upload your image and PixelForge creates
          optimized WebP versions for thumbnails,
          cards and detailed views.
        </p>

        <div className="mt-8">
          <Link
            href="/upload"
            className="inline-flex rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            Upload an Image
          </Link>
        </div>
      </div>
    </main>
  );
}