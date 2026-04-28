"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Key, Lock, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      
      if (data.debugCode) setDebugCode(data.debugCode);
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset");
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Password Reset!</h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <Link href="/login" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            Back to Login / العودة لتسجيل الدخول
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {/* Step: EMAIL */}
        {step === "email" && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Reset Password</h1>
              <p className="text-slate-400 leading-relaxed">
                Enter your email address to receive a 6-digit verification code.
              </p>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Email Address / البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    suppressHydrationWarning
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/5 p-4 rounded-xl border border-rose-500/10"><AlertCircle size={16} />{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20">
                {isLoading ? "Sending..." : "Send Code / إرسال الكود"}
              </button>
            </form>
          </>
        )}

        {/* Step: CODE */}
        {step === "code" && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Verify Code</h1>
              <p className="text-slate-400 leading-relaxed">
                We've sent a 6-digit code to <span className="text-indigo-400">{email}</span>.
              </p>
            </div>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Verification Code / كود التحقق</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    suppressHydrationWarning
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/5 p-4 rounded-xl border border-rose-500/10"><AlertCircle size={16} />{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20">
                {isLoading ? "Verifying..." : "Verify Code / تحقق من الكود"}
              </button>
            </form>
          </>
        )}

        {/* Step: RESET */}
        {step === "reset" && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">New Password</h1>
              <p className="text-slate-400 leading-relaxed">
                Choose a strong password to secure your account.
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">New Password / كلمة المرور الجديدة</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      suppressHydrationWarning
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Confirm Password / تأكيد كلمة المرور</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      suppressHydrationWarning
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
              {error && <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/5 p-4 rounded-xl border border-rose-500/10"><AlertCircle size={16} />{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20">
                {isLoading ? "Updating..." : "Update Password / تحديث كلمة المرور"}
              </button>
            </form>
          </>
        )}

      </div>
    </main>
  );
}
