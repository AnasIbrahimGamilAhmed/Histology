"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Save, Loader2, Link as LinkIcon, Unlink, CheckCircle2, AlertTriangle, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

// Premium SVGs
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 23 23">
    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
    <path fill="#f35325" d="M1 1h10v10H1z"/>
    <path fill="#81bc06" d="M12 1h10v10H12z"/>
    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
    <path fill="#ffba08" d="M12 12h10v10H12z"/>
  </svg>
);

export default function UserCenter() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);

  // Fetch linked providers from API
  const fetchLinkedAccounts = async () => {
    try {
      const res = await fetch("/api/user/linked-accounts");
      const data = await res.json();
      if (res.ok) setLinkedProviders(data.providers);
    } catch (err) {
      console.error("Failed to fetch linked accounts");
    }
  };

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        password: "",
        phone: (session.user as any).phone || "",
      });
      fetchLinkedAccounts();
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlink = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) return;
    
    setIsUnlinking(provider);
    try {
      const res = await fetch("/api/user/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unlink");

      setMessage({ type: 'success', text: `${provider} disconnected successfully` });
      fetchLinkedAccounts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUnlinking(null);
    }
  };

  const providerList = [
    { id: "google", name: "Google", icon: <GoogleIcon /> },
    { id: "facebook", name: "Facebook", icon: <FacebookIcon /> },
    { id: "microsoft-entra-id", name: "Microsoft", icon: <MicrosoftIcon /> }
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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Center / مركز المستخدم</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your HistoPro identity and connections</p>
          </div>
        </div>

        {/* Global Messages */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-5 rounded-[1.5rem] flex items-center gap-3 font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <p>{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black flex items-center gap-3 text-slate-800 uppercase tracking-tight">
                <Shield className="w-6 h-6 text-indigo-600" />
                Profile Details
              </h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">University ID (Permanent)</label>
                  <div className="px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-indigo-600 font-mono font-black text-xl shadow-inner">
                    {session.user.id}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 disabled:opacity-50 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 disabled:opacity-50 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="tel"
                      placeholder="+20 1xx xxxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 disabled:opacity-50 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 pt-4"
                    >
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type="password"
                          placeholder="Leave blank to keep current"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] border border-indigo-100 bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-700"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-70 active:scale-95"
                  >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Update Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: session.user.name || "", email: session.user.email || "", password: "" });
                    }}
                    className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Connections Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
              <h2 className="text-xl font-black flex items-center gap-3 mb-2 text-slate-800">
                <LinkIcon className="w-6 h-6 text-indigo-600" />
                Connections
              </h2>
              <p className="text-xs text-slate-400 font-bold mb-8 leading-relaxed">
                Connect for instant one-click access to your HistoPro dashboard.
              </p>

              <div className="space-y-4">
                {providerList.map((p) => {
                  const isLinked = linkedProviders.includes(p.id);
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${isLinked ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/30 border-slate-100 hover:border-indigo-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isLinked ? 'bg-white' : 'bg-white'}`}>
                          {p.icon}
                        </div>
                        <span className="font-black text-sm text-slate-700">{p.name}</span>
                      </div>
                      
                      {isLinked ? (
                        <button
                          disabled={isUnlinking === p.id}
                          onClick={() => handleUnlink(p.id)}
                          className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Disconnect"
                        >
                          {isUnlinking === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Unlink className="w-5 h-5" />}
                        </button>
                      ) : (
                        <button
                          onClick={() => signIn(p.id, { callbackUrl: '/user-center' })}
                          className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-white border border-indigo-100 rounded-xl shadow-sm hover:bg-indigo-50 transition-all active:scale-95"
                        >
                          Link
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Shield size={120} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Security Tip</p>
              <h3 className="text-lg font-black mb-3">Keep your ID safe</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Your University ID is your unique identifier. Never share your password with anyone else.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
