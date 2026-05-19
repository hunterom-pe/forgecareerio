import Link from "next/link";

export default function TermsOfService() {
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
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-12">Last Updated: April 2026</p>
        
        <div className="space-y-8 text-lg text-slate-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Acceptance of Terms</h2>
            <p>By accessing or using the Forge service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. AI Optimization & Third-Party Services</h2>
            <p>Forge utilizes state-of-the-art Artificial Intelligence (including Google Gemini) and third-party data providers (SerpApi) to automate your job search. By using the Service, you acknowledge that optimized content and job search results are provided as-is, and you are responsible for reviewing all AI-generated content before submission to third-party employers.</p>
            <p>Our service availability is dependent on the uptime of these third-party providers. We do not use your personal data to train external AI models.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. Disclaimer</h2>
            <p>The materials on Forge&apos;s website are provided on an &apos;as is&apos; basis. Forge makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Limitations</h2>
            <p>In no event shall Forge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Forge&apos;s website, even if Forge or a Forge authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">5. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of the State of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
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
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-blue-600 transition-colors">Terms of Service</Link>
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
