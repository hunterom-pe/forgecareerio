import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pt-24">
      {/* Locked Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-24 flex justify-between items-center">
          <Link href="/" className="logo-text">
            FORGE
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="hidden md:block text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Home
            </Link>
            <Link href="/login" className="px-8 py-3 bg-[#F1F4F9] text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E2E8F0] transition-all">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-12">Last Updated: April 2026</p>
        
        <div className="space-y-8 text-lg text-slate-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Zero-Access Policy</h2>
            <p>We operate on a <strong>Zero-Access</strong> architecture. Your resumes, job search history, and AI-generated documents are encrypted at rest. Forge employees, developers, and administrators have no technical means to view your private files or activity. Your data is strictly yours.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. Information We Collect</h2>
            <p>We collect minimal information required to manage your account: email address and basic profile details (name, job title, and location). Payment information is handled exclusively by our secure payment processor (Stripe) and is never stored on our servers.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. AI Processing & Service Providers</h2>
            <p>To provide our surgical optimization services, your document text and job descriptions are processed by Large Language Models (LLMs) via secure API (Google Gemini). We ensure that your data is handled according to strict enterprise privacy standards and is <strong>never</strong> used to train public AI models.</p>
            <p>We also utilize trusted third-party providers for core infrastructure: <strong>Supabase</strong> (for secure cloud storage and databases) and <strong>SerpApi</strong> (for real-time job discovery data).</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Data Ownership & Security</h2>
            <p>You retain 100% ownership of your data. Resumes are stored on secure, encrypted cloud infrastructure. We absolutely will not share, sell, or rent your personal data to any third parties for marketing or advertising purposes. You can delete your entire account history at any time from your profile settings.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Statement, please contact us at <Link href="/support" className="text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:decoration-blue-600">Support Center</Link> or hello@forgecareer.io.</p>
          </section>
        </div>
      </main>

      {/* Structured Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="logo-text !text-xl">FORGE</span>
            <p className="text-sm font-medium text-slate-600">The automated job search platform.</p>
          </div>
          
          <nav className="flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/privacy" className="text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="/support" className="hover:text-blue-600 transition-colors">Contact Support</Link>
          </nav>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
            &copy; 2026 FORGE SYSTEMS &bull; ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
