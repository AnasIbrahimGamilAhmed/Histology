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
    { id: "google", name: "Google", icon: "🌐", color: "bg-red-500 hover:bg-red-600" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "bg-blue-600 hover:bg-blue-700" },
    { id: "microsoft-entra-id", name: "Microsoft", icon: "🪟", color: "bg-cyan-600 hover:bg-cyan-700" },
    { id: "apple", name: "Apple", icon: "🍎", color: "bg-gray-800 hover:bg-gray-900" }
  ];

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 lg:p-12 pb-32 md:pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Center</h1>
            <p className="text-gray-500">Manage your account settings and linked accounts</p>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Profile Settings */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Profile Details
              </h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University ID (Non-editable)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-mono">
                  {session.user.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                />
              </div>

              {isEditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </motion.div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: session.user.name || "", email: session.user.email || "", password: "" });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Linked Accounts */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Linked Accounts
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Connect your social accounts to log in quickly without a password.
            </p>

            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <span className="font-semibold text-gray-700">{provider.name}</span>
                  </div>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/user-center' })}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${provider.color}`}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
              <strong>Note:</strong> Connecting an account here will link it to your current ID ({session.user.id}). Next time you log in with {providers[0].name}, you will automatically log into this account.
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
