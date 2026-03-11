"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-500 max-w-md">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
