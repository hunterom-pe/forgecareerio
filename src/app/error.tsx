"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-[440px] text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="text-red-600" size={36} />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Something broke.
          </h1>
          <p className="text-slate-600 font-medium leading-relaxed">
            We hit an unexpected error. Our team has been notified and we&apos;re looking into it.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-400 pt-2">
              Reference: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors min-h-[44px]"
          >
            <RotateCw size={16} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <ArrowLeft size={16} /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
