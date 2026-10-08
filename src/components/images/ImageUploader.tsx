"use client";

import { ChangeEvent, useEffect, useState } from "react";

interface UploadResponse {
  success: boolean;
  message: string;
  image?: {
    id: string;
    originalName: string;
    thumbnail: string;
    optimized: string;
    detail: string;
  };
}

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const [result, setResult] =
    useState<UploadResponse["image"] | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setResult(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Please select a JPEG, PNG or WebP image."
      );

      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Image size must be less than 10MB.");

      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);
    setStatus("Uploading and optimizing image...");

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        "/api/images/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data: UploadResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Upload failed."
        );
      }

      setResult(data.image ?? null);

      setStatus("Image optimized successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      setStatus("");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setStatus("");
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Upload box */}

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8">
        <label
          htmlFor="image-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center transition hover:bg-gray-100"
        >
          <div className="mb-4 text-4xl">
            🖼️
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Select an image
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            JPEG, PNG or WebP · Maximum 10MB
          </p>

          <span className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white">
            Choose Image
          </span>

          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Preview */}

      {file && preview && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Selected Image
              </h3>

              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>

            <div className="overflow-hidden rounded-xl bg-gray-100">
              <img
                src={preview}
                alt={file.name}
                className="max-h-[500px] w-full object-contain"
              />
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-gray-500">
                  File
                </span>

                <p className="truncate font-medium">
                  {file.name}
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Size
                </span>

                <p className="font-medium">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Type
                </span>

                <p className="font-medium">
                  {file.type}
                </p>
              </div>
            </div>
          </div>

          {/* Upload */}

          <div className="border-t border-gray-200 bg-gray-50 p-5">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Processing..."
                : "Upload & Optimize"}
            </button>

            {status && (
              <p className="mt-3 text-center text-sm text-gray-600">
                {status}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Result */}

      {result && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="text-lg font-semibold text-green-900">
            Optimization Complete
          </h3>

          <p className="mt-1 text-sm text-green-700">
            Your image has been processed successfully.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <ResultCard
              title="Thumbnail"
              src={result.thumbnail}
            />

            <ResultCard
              title="Optimized"
              src={result.optimized}
            />

            <ResultCard
              title="Detail"
              src={result.detail}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ResultCardProps {
  title: string;
  src: string;
}

function ResultCard({
  title,
  src,
}: ResultCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-green-200 bg-white">
      <div className="aspect-video bg-gray-100">
        <img
          src={src}
          alt={title}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-xs text-blue-600 hover:underline"
        >
          Open image
        </a>
      </div>
    </div>
  );
}