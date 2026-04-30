"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Loader2, CheckCircle2, Mail, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

interface PendingData {
  email: string;
  provider: string;
  name: string | null;
}

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingId = searchParams.get("pendingId");
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("123456");
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPending, setIsFetchingPending] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [pendingData, setPendingData] = useState<PendingData | null>(null);

  useEffect(() => {
    if (!pendingId) {
      router.push("/signup");
      return;
    }
    
    // Fetch the pending OAuth data to pre-fill name
    fetch(`/api/auth/pending-oauth?id=${pendingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError("Session expired. Please try signing up again. / انتهت الجلسة، حاول مرة أخرى.");
          setIsFetchingPending(false);
          return;
        }
        setPendingData(data);
        if (data.name) setName(data.name);
        setIsFetchingPending(false);
      })
      .catch(() => {
        setError("Failed to load signup data.");
        setIsFetchingPending(false);
      });
  }, [pendingId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Please enter your name / أدخل اسمك");
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters / كلمة المرور 4 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/complete-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, name: name.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setGeneratedId(data.universityId);
      setSuccess(true);
      
      // Auto login after 3 seconds
      setTimeout(() => {
        signIn("credentials", {
          universityId: data.universityId,
          password: password,
          callbackUrl: "/study",
        });
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to HistoPro! 🎉</h2>
          <p className="text-slate-500 text-sm">أهلاً بيك في هيستوبرو!</p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-indigo-200">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Your University ID / رقمك الجامعي</p>
            <p className="text-3xl font-black text-indigo-600 font-mono mt-1">{generatedId}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-left">
            <p className="text-xs font-bold text-amber-700">📝 Remember your credentials / تذكر بياناتك:</p>
            <p className="text-sm text-amber-600 mt-1">ID: <span className="font-mono font-bold">{generatedId}</span></p>
            <p className="text-sm text-amber-600">Password: <span className="font-mono font-bold">{password}</span></p>
            <p className="text-xs text-amber-500 mt-1">You can change your password later in User Center / تقدر تغير كلمة المرور من إعدادات الحساب.</p>
          </div>
          <p className="text-slate-600">
            Redirecting to study center... / جاري التحويل...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complete Your Profile</h1>
          <p className="text-slate-500 text-sm mt-1">أكمل بياناتك لإنشاء حسابك</p>
          <p className="text-slate-400 text-xs mt-2">A random University ID will be generated for you automatically.</p>
        </div>

        {/* Show pending OAuth info */}
        {pendingData && (
          <div className="mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700 font-medium">{pendingData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-600 capitalize">{pendingData.provider === "microsoft-entra-id" ? "Microsoft" : "Google"} Account</span>
            </div>
          </div>
        )}

        {isFetchingPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Display Name / الاسم</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="Full Name / الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Account Password / كلمة المرور</label>
              
              {/* Password toggle */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => { setUseCustomPassword(false); setPassword("123456"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!useCustomPassword ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Default (123456)
                </button>
                <button
                  type="button"
                  onClick={() => { setUseCustomPassword(true); setPassword(""); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${useCustomPassword ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Custom Password
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  required
                  type={useCustomPassword ? "password" : "text"}
                  placeholder={useCustomPassword ? "Choose a password / اختر كلمة مرور" : "123456"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  readOnly={!useCustomPassword}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium ${!useCustomPassword ? 'bg-slate-50 text-slate-400' : ''}`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 ml-1">
                You can always change your password later in User Center / تقدر تغيره بعدين من الإعدادات.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl border border-rose-100"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              disabled={isLoading || isFetchingPending}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create My Account / إنشاء الحساب"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}
