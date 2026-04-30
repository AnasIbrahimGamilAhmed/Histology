"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Key, Lock, ShieldCheck, Search, Send, Smartphone, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"id" | "select-email" | "code" | "reset" | "success">("id");
  const [universityId, setUniversityId] = useState("");
  const [recoveryOptions, setRecoveryOptions] = useState<{type: 'email' | 'phone', masked: string, full: string, provider: string}[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookupId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User not found");
      
      setRecoveryOptions(data.options);
      setStep("select-email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (fullEmail: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedEmail(fullEmail);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId, email: fullEmail }),
      });
      if (!res.ok) throw new Error("Failed to send code. Please try again later.");
      setStep("code");
    } catch (err: any) {
      setError(err.message);
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
        body: JSON.stringify({ email: selectedEmail, code }),
      });
      if (!res.ok) throw new Error("Invalid code");
      setStep("reset");
    } catch (err: any) {
      setError(err.message);
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
        body: JSON.stringify({ email: selectedEmail, code, password: newPassword }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-100 p-8 md:p-10 rounded-[2.5rem] shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
          <p className="text-slate-500 leading-relaxed">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <Link href="/login" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
            Back to Login / العودة لتسجيل الدخول
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 md:py-12">
      <div className="max-w-md w-full bg-white border border-slate-100 p-6 md:p-10 rounded-[2.5rem] shadow-xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-8 text-sm font-bold">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {/* Step: UNIVERSITY ID */}
        {step === "id" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Recovery</h1>
              <p className="text-slate-500 leading-relaxed text-sm">
                Enter your University ID to find your linked recovery emails.
              </p>
            </div>
            <form onSubmit={handleLookupId} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">University ID / معرف الطالب</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value.toUpperCase())}
                    placeholder="ABC-1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-4 rounded-2xl border border-rose-100"><AlertCircle size={16} />{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find My Account"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step: SELECT EMAIL */}
        {step === "select-email" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-3">Verification</h1>
              <p className="text-slate-500 text-sm">
                Where should we send the 6-digit verification code?
              </p>
            </div>
            <div className="space-y-3">
              {recoveryOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendEmail(opt.full)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      {opt.type === 'email' ? <Mail className="w-5 h-5 text-indigo-600" /> : <Smartphone className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{opt.provider}</p>
                      <p className="text-slate-700 font-bold">{opt.masked}</p>
                    </div>
                  </div>
                  <Send className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              ))}
              <button 
                onClick={() => setStep("id")}
                className="w-full py-3 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Use a different ID
              </button>
            </div>
            {isLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
              </div>
            )}
          </motion.div>
        )}

        {/* Step: CODE */}
        {step === "code" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-3">Security Code</h1>
              <p className="text-slate-500 text-sm">
                Enter the code sent to <span className="text-indigo-600 font-bold">{selectedEmail.substring(0, 3)}...</span>
              </p>
            </div>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">6-Digit Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-center text-xl font-black tracking-[0.5em] outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-4 rounded-2xl border border-rose-100"><AlertCircle size={16} />{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step: RESET */}
        {step === "reset" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-3">New Password</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Choose a strong password that you haven't used before.
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
              {error && <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-4 rounded-2xl border border-rose-100"><AlertCircle size={16} />{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          </motion.div>
        )}

      </div>
    </main>
  );
}
