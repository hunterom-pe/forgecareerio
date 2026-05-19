/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { calculatePasswordStrength } from "@/lib/password";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsLogin(false);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!isLogin) {
        // Client-side validation for registration
        if (!formData.name.trim()) {
          throw new Error("First name is required");
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error("Please enter a valid email address");
        }

        if (formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        
        if (formData.password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
          throw new Error("Password must contain both letters and numbers");
        }

        // Register user
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }
      }

      // Login (both for existing users and newly registered users)
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden bg-slate-50">
      {/* Mesh Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[120px] animate-mesh" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-400/10 blur-[120px] animate-mesh" style={{ animationDelay: '-5s' }} />
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[100px] animate-mesh" style={{ animationDelay: '-10s' }} />

      <div className="w-full max-w-[440px] space-y-8 relative z-10">
        
        <div className="text-center mb-4">
          <Link href="/" className="logo-text !text-4xl tracking-[0.4em]">
            FORGE
          </Link>
        </div>

        <div className="glass-panel p-12 border-white shadow-2xl shadow-slate-200/50 space-y-10">
          <div className="space-y-3">
            <h2 className="heading-editorial !text-4xl tracking-tighter leading-none">
              {isLogin ? "Welcome back" : "Join the elite"}
            </h2>
            <p className="text-slate-600 font-medium text-[16px]">
              {isLogin ? "Enter your credentials to resume your hunt." : "Start your automated career acceleration today."}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <button 
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4.5 rounded-2xl border border-white bg-white/60 hover:bg-white transition-all text-slate-700 font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200/20 backdrop-blur-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.92 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-6 py-2">
              <div className="flex-1 h-[1px] bg-slate-200/60" />
              <span className="label-mono !text-[9px] text-slate-500">secure email login</span>
              <div className="flex-1 h-[1px] bg-slate-200/60" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="label-mono ml-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="John" 
                      className="input-glass pl-12"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required={!isLogin} 
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="label-mono ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="input-glass pl-12"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="label-mono ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="input-glass pl-12 pr-12"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                    minLength={isLogin ? 1 : 8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {!isLogin && formData.password && (
                  <div className="space-y-2 px-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strength</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${calculatePasswordStrength(formData.password).text}`}>
                        {calculatePasswordStrength(formData.password).label}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      {[0, 1, 2, 3].map((idx) => {
                        const strength = calculatePasswordStrength(formData.password);
                        const scoreMap = { "Weak": 1, "Fair": 2, "Good": 3, "Strong": 4, "Elite": 4 };
                        const score = (scoreMap as any)[strength.label];
                        return (
                          <div 
                            key={idx} 
                            className={`flex-1 rounded-full transition-all duration-500 ${idx < score ? strength.color : 'bg-slate-100'}`} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <p className="label-mono !text-slate-500 !text-[9px] ml-1">
                    Min. 8 characters with letters and numbers
                  </p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="label-mono ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="input-glass pl-12 pr-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                    {confirmPassword && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {formData.password === confirmPassword ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-4 text-[13px] uppercase tracking-[0.2em]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="text-center pt-4">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }} 
                type="button"
                className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm min-h-[44px] px-2 inline-flex items-center justify-center rounded-lg"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-bold text-blue-600 underline decoration-blue-600/30 underline-offset-4">{isLogin ? "Sign Up" : "Log In"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
