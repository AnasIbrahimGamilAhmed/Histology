"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Save, Loader2, Link as LinkIcon, Unlink } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function UserCenter() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        password: "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setMessage({ type: 'success', text: "Profile updated successfully!" });
      await update({ name: formData.name, email: formData.email });
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const providers = [
    { id: "google", name: "Google", icon: "🌐", color: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "bg-[#1877F2] text-white hover:bg-[#166fe5]" },
    { id: "microsoft-entra-id", name: "Microsoft", icon: "🪟", color: "bg-[#00a4ef] text-white hover:bg-[#0089c7]" }
  ];

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 pb-32 md:pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Center / مركز المستخدم</h1>
            <p className="text-slate-500 mt-1">Manage your identity and connected learning accounts</p>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
          >
            <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
            <p className="font-medium">{message.text}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Settings */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                <Shield className="w-6 h-6 text-indigo-600" />
                Profile Details / بيانات الحساب
              </h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">University ID (Permanent)</label>
                <div className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 font-mono font-bold text-lg">
                  {session.user.id}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name / الاسم بالكامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address / البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
                />
              </div>

              {isEditing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 mt-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Change Password / تغيير كلمة المرور</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                  <p className="mt-2 text-xs text-slate-400 italic">Only fill this if you want to update your manual login password.</p>
                </motion.div>
              )}
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Profile Settings
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: session.user.name || "", email: session.user.email || "", password: "" });
                  }}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Linked Accounts */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-3 text-slate-800">
              <LinkIcon className="w-6 h-6 text-indigo-600" />
              Connected Accounts
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Link your social profiles to bypass the login form and enter HistoPro instantly.
            </p>

            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="group relative flex items-center justify-between p-5 border border-slate-100 rounded-[1.5rem] hover:border-indigo-200 transition-all bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">{provider.icon}</span>
                    <span className="font-bold text-slate-700">{provider.name}</span>
                  </div>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/user-center' })}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 ${provider.color}`}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                <span className="font-bold block mb-1">💡 Smart Link Technology</span>
                By connecting an account, you can log in with one click. It is linked specifically to your ID: <span className="font-bold">{session.user.id}</span>.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>

        </div>
      </div>
    </div>
  );
}
