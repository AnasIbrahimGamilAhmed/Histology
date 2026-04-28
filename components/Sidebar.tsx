"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Microscope, 
  LogOut, 
  Settings,
  ChevronRight,
  User
} from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Study Navigator", href: "/study", icon: <BookOpen size={20} /> },
    { name: "Exam Simulator", href: "/exam", icon: <Brain size={20} /> },
    { name: "Histology Atlas", href: "/atlas", icon: <Microscope size={20} /> },
  ];

  if (pathname === "/" || pathname === "/login" || pathname === "/forgot-password") return null;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-[#020617] border-r border-slate-800 z-50 hidden md:flex flex-col py-8 transition-all duration-300">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <Microscope size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white hidden lg:block">HISTO<span className="text-indigo-500">PRO</span></span>
        </div>

        <nav className="flex-1 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"} transition-colors`}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm hidden lg:block">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-6 border-t border-slate-800 space-y-2">
          <button 
            type="button"
            aria-label="Sign Out"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#020617]/80 backdrop-blur-xl border-t border-slate-800 z-[100] flex md:hidden items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-xl transition-all ${isActive ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500"}`}
            >
              {item.icon}
            </Link>
          );
        })}
        <button 
          type="button"
          aria-label="Sign Out"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 rounded-xl text-slate-500"
        >
          <LogOut size={20} />
        </button>
      </nav>
    </>
  );
}
