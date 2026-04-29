"use client";

import Link from "next/link";
import { Microscope, Brain, BookOpen, BarChart3, ChevronRight, PlayCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] rounded-full bg-purple-500/5 blur-[80px]" 
        />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold mb-10 shadow-lg shadow-indigo-500/5"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            Platform Update v2.0 Live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-tight"
          >
            Histology Practical <br className="hidden md:block" /> Simulator
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl text-xl md:text-2xl text-slate-400 leading-relaxed mb-12 font-medium"
          >
            The ultimate microscope simulation for medical students. Master tissue identification with <span className="text-indigo-400 font-bold">36+ high-fidelity specimens</span> and realistic lab exam conditions.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link 
              href="/dashboard" 
              className="group px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <PlayCircle size={24} />
              Get Started Now
            </Link>
            <Link 
              href="/study" 
              className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl border border-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Explore Study Tree
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          <FeatureCard 
            href="/atlas"
            icon={<Microscope size={32} />} 
            title="Micro-Views" 
            desc="Authentic microscope identification with varying zoom levels and field conditions." 
            delay={0.4}
          />
          <FeatureCard 
            href="/exam"
            icon={<Brain size={32} />} 
            title="Adaptive Testing" 
            desc="Infinite unique exam instances that focus on your weak areas and common confusions." 
            delay={0.5}
          />
          <FeatureCard 
            href="/study"
            icon={<BookOpen size={32} />} 
            title="Study Tree" 
            desc="Interactive hierarchy of all tissue types with pathognomonic features and expert tips." 
            delay={0.6}
          />
          <FeatureCard 
            href="/dashboard"
            icon={<BarChart3 size={32} />} 
            title="Analytics" 
            desc="Detailed feedback on your identification accuracy and speed per tissue category." 
            delay={0.7}
          />
        </div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="rounded-[4rem] bg-indigo-600/5 border border-indigo-500/10 p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
          <Sparkles className="mx-auto mb-8 text-indigo-400" size={48} />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Designed for Medical Excellence</h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-400 leading-relaxed font-medium">
            Developed in collaboration with pathology experts to provide students with a realistic lab environment. Our engine generates unique scenarios every time, ensuring you never stop learning.
          </p>
        </motion.div>

        {/* Footer */}
        <footer className="mt-32 border-t border-slate-900 pt-16 pb-12 flex flex-col md:flex-row justify-between items-center gap-10 text-slate-500 text-sm font-medium">
          <p>© 2026 Histology Practical Platform. Designed for Medical Education.</p>
          <div className="flex gap-10">
            <Link href="/login" className="hover:text-indigo-400 transition-colors">Student Login</Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Performance Dashboard</Link>
            <Link href="/exam" className="hover:text-indigo-400 transition-colors">Exam Engine</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, href, delay }: { icon: React.ReactNode; title: string; desc: string; href: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link href={href} className="group p-10 h-full rounded-[3rem] bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 backdrop-blur-md block relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-[40px] group-hover:bg-indigo-500/10 transition-all" />
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
          {icon}
        </div>
        <h3 className="text-2xl font-black text-white mb-4 flex items-center justify-between tracking-tight">
          {title}
          <ChevronRight size={24} className="text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
        </h3>
        <p className="text-slate-400 leading-relaxed font-medium">
          {desc}
        </p>
      </Link>
    </motion.div>
  );
}
