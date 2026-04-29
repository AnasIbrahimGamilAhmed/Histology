"use client";

import { useEffect, useState } from "react";
import { handleSignOut } from "@/lib/actions/authActions";
import { User, LogOut } from "lucide-react";

export function UserProfileBar() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSession(data);
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      } finally {
        setLoading(false);
      }
    }
    getSession();
  }, []);

  if (loading || !session?.user) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/60 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <User size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Diagnostic Profile</p>
          <p className="text-sm font-black text-white">
            {session.user.name ?? session.user.email ?? "Student"}
          </p>
        </div>
      </div>

      <button
        onClick={() => handleSignOut()}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5"
      >
        <LogOut size={14} />
        Sign Out
      </button>
    </div>
  );
}
