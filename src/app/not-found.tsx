import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-[440px] text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Compass className="text-blue-600" size={36} />
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">
            404
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Off the map.
          </h1>
          <p className="text-slate-600 font-medium leading-relaxed">
            We couldn&apos;t find the page you&apos;re looking for. It may have moved or never existed.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors min-h-[44px]"
          >
            <ArrowLeft size={16} /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
