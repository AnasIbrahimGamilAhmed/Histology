"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Home, BookOpen, Microscope, Brain, Menu, X, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

const navItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Atlas", icon: Microscope, href: "/atlas" },
  { name: "Study", icon: BookOpen, href: "/study" },
  { name: "Exam", icon: Brain, href: "/exam" },
];

export default function MobileNav() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <>
      {/* Bottom Nav Bar for Mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <nav className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-6 py-4 flex items-center justify-between shadow-2xl shadow-indigo-500/20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative group">
                <div className={`p-3 rounded-2xl transition-all ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" : "text-slate-400 hover:text-indigo-400 hover:bg-white/5"}`}>
                  <item.icon size={22} />
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
          <button 
            onClick={() => setIsOpen(true)}
            className="p-3 text-slate-400 hover:text-indigo-400"
          >
            <Menu size={22} />
          </button>
        </nav>
      </div>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[60] bg-[#020617] p-8 lg:hidden flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-16">
              <h2 className="text-2xl font-black text-white italic tracking-tighter">HISTO<span className="text-indigo-500">PRO</span></h2>
              <button onClick={() => setIsOpen(false)} className="p-4 bg-slate-900 rounded-2xl text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group p-8 rounded-3xl bg-slate-900/50 border border-white/5 flex items-center gap-6 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all"
                >
                  <div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all text-indigo-400">
                    <item.icon size={28} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white">{item.name}</span>
                    <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">Go to {item.name.toLowerCase()}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-white/5">
              {isAuthenticated ? (
                <div className="flex items-center gap-4 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-white font-black">{session?.user?.name || "Student"}</p>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Mastery Portal</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900 border border-white/5 text-white font-bold"
                  >
                    Login
                    <span className="text-[10px] opacity-50 uppercase tracking-widest">تسجيل دخول</span>
                  </Link>
                  <Link 
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20"
                  >
                    Sign Up
                    <span className="text-[10px] opacity-80 uppercase tracking-widest">حساب جديد</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
