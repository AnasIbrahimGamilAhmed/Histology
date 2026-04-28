"use client";

import Link from "next/link";
import { Microscope, Brain, BookOpen, BarChart3, ChevronRight, PlayCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] rounded-full bg-purple-500/5 blur-[80px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform Update v2.0 Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Histology Practical <br className="hidden md:block" /> Simulator
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
            The ultimate microscope simulation for medical students. Master tissue identification with <span className="text-indigo-400 font-semibold">36+ high-fidelity specimens</span> and realistic lab exam conditions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <PlayCircle size={20} />
              Get Started Now
            </Link>
            <Link 
              href="/study" 
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              Explore Study Tree
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <FeatureCard 
            href="/atlas"
            icon={<Microscope size={24} />} 
            title="Micro-Views" 
            desc="Authentic microscope identification with varying zoom levels and field conditions." 
          />
          <FeatureCard 
            href="/exam"
            icon={<Brain size={24} />} 
            title="Adaptive Testing" 
            desc="Infinite unique exam instances that focus on your weak areas and common confusions." 
          />
          <FeatureCard 
            href="/study"
            icon={<BookOpen size={24} />} 
            title="Study Tree" 
            desc="Interactive hierarchy of all tissue types with pathognomonic features and expert tips." 
          />
          <FeatureCard 
            href="/dashboard"
            icon={<BarChart3 size={24} />} 
            title="Analytics" 
            desc="Detailed feedback on your identification accuracy and speed per tissue category." 
          />
        </div>

        {/* Footer / Info */}
        <div className="border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm">
          <p>© 2026 Histology Practical Platform. Designed for Medical Education.</p>
          <div className="flex gap-8">
            <Link href="/login" className="hover:text-indigo-400 transition-colors">Student Login</Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Performance Dashboard</Link>
            <Link href="/exam" className="hover:text-indigo-400 transition-colors">Exam Engine</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 backdrop-blur-sm block">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
        {title}
        <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
      </h3>
      <p className="text-slate-400 leading-relaxed">
        {desc}
      </p>
    </Link>
  );
}
