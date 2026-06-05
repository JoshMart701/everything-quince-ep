"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-8">
      <p className="text-red-600 font-semibold">Something went wrong</p>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button onClick={reset} className="text-sm text-[#4f46e5] font-semibold underline">Try again</button>
    </div>
  );
}
