"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { histologyData, TissueSection } from "@/lib/data/histologyData";
import Link from "next/link";
import { ChevronRight, Microscope, Lightbulb, BookOpen, Brain, ArrowLeft, AlertOctagon, Sparkles, Search, Languages, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MicroscopeLoader from "@/components/MicroscopeLoader";
import StudyGuideExporter from "@/components/StudyGuideExporter";

function ComparisonCard({ sample, isComparison = false, opposingSample }: { sample: TissueSection; isComparison?: boolean; opposingSample?: TissueSection }) {
  const microImage = sample.imageUrls?.find(url => url.toLowerCase().includes("micro")) || sample.imageUrl;
  
  return (
    <div className={`flex flex-col rounded-[3rem] overflow-hidden border ${isComparison ? "border-indigo-500/30 bg-indigo-500/5" : "border-slate-800 bg-slate-900/40"} backdrop-blur-xl shadow-2xl h-full`}>
      <div className="p-8 border-b border-white/5">
        <h3 className="text-2xl font-black text-white mb-2">{sample.title}</h3>
        <p className="text-slate-400 text-sm font-medium line-clamp-2">{sample.description}</p>
      </div>
      
      <div className="grid grid-cols-2 bg-black h-56 border-b border-white/5 relative">
        <div className="relative overflow-hidden group">
          <img src={sample.imageUrl || sample.imageUrls?.[0]} alt={sample.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/20" />
          <span className="absolute bottom-3 left-3 text-[8px] font-black uppercase text-white/60 bg-black/40 px-2 py-1 rounded-md">General View</span>
        </div>
        <div className="relative overflow-hidden border-l border-white/10 group cursor-crosshair">
          <img src={microImage} alt={`${sample.title} Micro`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-indigo-500/10" />
          
          {/* REFINED VIRTUAL TARGETING SYSTEM */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div 
              animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 180] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border border-indigo-400/30 rounded-full flex items-center justify-center"
            >
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-indigo-500/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-indigo-500/50" />
          </div>

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-white whitespace-nowrap shadow-2xl">
              Focus: Diagnostic Region
            </div>
          </div>

          <span className="absolute bottom-3 left-3 text-[8px] font-black uppercase text-indigo-400 bg-black/40 px-2 py-1 rounded-md tracking-tighter">Microscope Context</span>
        </div>
      </div>

      <div className="p-8 space-y-6 flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={14} className="text-indigo-400" />
              Diagnostic Differentiator
            </h4>
            <span className="text-[10px] font-bold text-indigo-500/60 font-arabic">المؤشر التشخيصي الفارق</span>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-sm text-indigo-200 font-bold leading-relaxed italic">
            <div className="mb-2">
              "{opposingSample ? `Unlike ${opposingSample.title}, this specimen shows ${sample.practicalTips?.[0].toLowerCase()}.` : sample.practicalTips?.[0]}"
            </div>
            {sample.titleAr && (
              <div className="text-xs text-indigo-400/80 font-arabic text-right border-t border-indigo-500/10 pt-2">
                على عكس {opposingSample?.titleAr || opposingSample?.title || "العينة الأخرى"}، تتميز هذه العينة بـ {sample.practicalTips?.[0]}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" />
              Cellular Detail
            </h4>
            <span className="text-[10px] font-bold text-emerald-500/60 font-arabic">التفاصيل الخلوية</span>
          </div>
          <ul className="space-y-3">
            {sample.practicalTips?.slice(1, 4).map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300 font-semibold leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <div className="flex flex-col gap-1">
                  <span>{tip}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function StudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryId = searchParams.get("category");
  const sampleId = searchParams.get("sample");

  const [selectedSection, setSelectedSection] = useState<TissueSection | null>(null);
  const [activeParent, setActiveParent] = useState<TissueSection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparisonSample, setComparisonSample] = useState<TissueSection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExtraStudy, setShowExtraStudy] = useState(false);

  useEffect(() => {
    if (categoryId) {
      const cat = histologyData.find(c => c.id === categoryId);
      if (cat) {
        setActiveParent(cat);
        if (sampleId) {
          const sample = cat.subSections?.find(s => s.id === sampleId);
          if (sample) setSelectedSection(sample);
        }
      }
    } else {
      setActiveParent(null);
      setSelectedSection(null);
    }
  }, [categoryId, sampleId]);

  const updateUrl = (catId: string | null, sampId: string | null) => {
    const params = new URLSearchParams();
    if (catId) params.set("category", catId);
    if (sampId) params.set("sample", sampId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSetParent = (category: TissueSection | null) => {
    setIsLoading(true);
    setTimeout(() => {
      updateUrl(category?.id || null, null);
      setIsLoading(false);
    }, 800);
  };

  const handleSetSample = (sample: TissueSection | null) => {
    updateUrl(activeParent?.id || null, sample?.id || null);
  };

  const findSampleByName = (name: string): TissueSection | null => {
    for (const cat of histologyData) {
      if (cat.subSections) {
        const found = cat.subSections.find(s => s.title.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
    }
    return null;
  };

  const filteredData = histologyData.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.titleAr && cat.titleAr.includes(searchQuery)) ||
    cat.subSections?.some(sub => 
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.titleAr && sub.titleAr.includes(searchQuery))
    )
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 pb-20 overflow-x-hidden">
      {/* ... (keep background decoration) */}

      <AnimatePresence>
        {comparisonSample && selectedSection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020617]/98 backdrop-blur-2xl flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto w-full">
              <h2 className="text-3xl font-black text-white flex items-center gap-4">
                <Sparkles className="text-indigo-400" />
                Comparison Mode | طور المقارنة
              </h2>
              <button 
                onClick={() => setComparisonSample(null)}
                className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all"
              >
                Close Comparison
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto w-full">
              <ComparisonCard sample={selectedSection} opposingSample={comparisonSample} />
              <ComparisonCard sample={comparisonSample} isComparison opposingSample={selectedSection} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <header className="mb-16">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500"
              >
                Study Navigator
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 text-slate-400 text-lg max-w-2xl leading-relaxed font-medium"
              >
                Explore the cellular architecture of the human body. Master pathognomonic features across <span className="text-indigo-400 font-bold">50+ histological specimens</span>.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto"
            >
              {!activeParent && (
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search specimens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-4 pl-14 pr-6 text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium backdrop-blur-xl shadow-xl"
                  />
                </div>
              )}
              <Link 
                href="/exam" 
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
              >
                <Brain size={20} />
                <span>Quick Exam</span>
              </Link>
            </motion.div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32"
            >
              <MicroscopeLoader />
            </motion.div>
          ) : !activeParent ? (
            /* CATEGORY GRID */
            <motion.div 
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredData.map((category) => (
                <motion.button
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  onClick={() => handleSetParent(category)}
                  className="group p-10 rounded-[3rem] bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/30 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 backdrop-blur-md relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-[40px] group-hover:bg-indigo-500/10 transition-all" />
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl border border-white/5">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors flex items-center justify-between tracking-tight">
                    {category.title}
                  </h3>
                  {category.titleAr && <p className="text-sm font-black text-slate-500 mb-6 flex items-center gap-2"><Languages size={14} /> {category.titleAr}</p>}
                  <p className="text-slate-400 leading-relaxed font-medium text-sm mb-10 flex-grow">
                    {category.description}
                  </p>
                  <div className="mt-auto flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                    Explore {category.subSections?.length || 0} Modules <ChevronRight size={16} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            /* SUB-SECTION SELECTOR & CONTENT VIEW */
            <motion.div 
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col lg:grid lg:grid-cols-[350px_1fr] gap-12"
            >
              {/* Sidebar List */}
              <aside className="space-y-6">
                <button 
                  onClick={() => { setActiveParent(null); setSelectedSection(null); }}
                  className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-widest text-xs hover:text-indigo-300 transition-all mb-8 bg-indigo-500/5 px-6 py-3 rounded-xl border border-indigo-500/10"
                >
                  <ArrowLeft size={16} /> Categories
                </button>
                
                <div className="p-3 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/60 backdrop-blur-md shadow-2xl overflow-hidden">
                  <h2 className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800/50 mb-4 flex justify-between items-center">
                    <span>{activeParent.title}</span>
                  </h2>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                    {activeParent.subSections?.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSetSample(sub)}
                        className={`w-full flex flex-col p-5 rounded-[1.5rem] text-left transition-all relative overflow-hidden group ${
                          selectedSection?.id === sub.id 
                          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" 
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full relative z-10">
                          <span className="font-bold text-sm tracking-tight">{sub.title}</span>
                          <ChevronRight size={16} className={`transition-transform ${selectedSection?.id === sub.id ? "translate-x-1" : "opacity-0"}`} />
                        </div>
                        {sub.titleAr && (
                          <span className={`text-[10px] font-black mt-2 relative z-10 opacity-60`}>
                            {sub.titleAr}
                          </span>
                        )}
                        {selectedSection?.id === sub.id && (
                          <motion.div layoutId="active-bg" className="absolute inset-0 bg-indigo-600 z-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Content Area */}
              <section className="min-h-[600px]">
                <AnimatePresence mode="wait">
                  {!selectedSection ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-20 rounded-[4rem] border-2 border-dashed border-slate-800 bg-slate-900/20"
                    >
                      <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse shadow-2xl">
                        <Sparkles size={48} />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-4">Select Specimen</h3>
                      <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Pick a tissue module from the sidebar to begin analyzing its diagnostic features.</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key={selectedSection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <header className="mb-12">
                        <div className="flex items-baseline gap-6 mb-4">
                          <h2 className="text-5xl font-black text-white tracking-tight">
                            {selectedSection.title}
                          </h2>
                          {selectedSection.titleAr && <span className="text-2xl font-black text-indigo-500/40">{selectedSection.titleAr}</span>}
                        </div>
                        <p className="text-slate-400 text-xl leading-relaxed font-medium max-w-3xl">{selectedSection.description}</p>
                      </header>

                      {/* Image Gallery */}
                      {selectedSection.imageUrls && selectedSection.imageUrls.length > 0 && (
                        <div className="mb-12">
                          <div className={`grid gap-8 ${selectedSection.imageUrls.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                            {selectedSection.imageUrls.map((url, idx) => (
                              <motion.div 
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                className="relative group rounded-[3rem] overflow-hidden border border-slate-800 bg-black shadow-2xl cursor-zoom-in"
                              >
                                <img 
                                  src={url} 
                                  alt={`${selectedSection.title} view ${idx + 1}`}
                                  className="w-full h-[450px] object-contain transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent backdrop-blur-[2px] text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 border-t border-white/5 flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {url.toLowerCase().includes("micro") ? "Microscope Field" : "Gross View"}
                                  </div>
                                  <span className="text-indigo-500">Click to focus</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-10">
                        {/* Practical Tips */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="p-10 rounded-[3.5rem] bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md shadow-2xl relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                            <Microscope size={120} />
                          </div>
                          <h4 className="flex items-center gap-4 text-white font-black mb-10 text-xl tracking-tight">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                              <Microscope size={24} />
                            </div>
                            Diagnostic Identification
                          </h4>
                          <ul className="space-y-6">
                            {selectedSection.practicalTips?.map((tip, idx) => (
                              <li key={idx} className="flex flex-col gap-3 group">
                                <div className="flex items-start gap-4 text-slate-300">
                                  <div className="mt-1 p-1.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                                    <Lightbulb size={16} />
                                  </div>
                                  <span className="leading-relaxed font-semibold text-sm">{tip}</span>
                                </div>
                                {selectedSection.practicalTipsAr?.[idx] && (
                                  <p className="text-indigo-400/50 text-xs mr-10 text-right font-black border-r-2 border-indigo-500/20 pr-4">{selectedSection.practicalTipsAr[idx]}</p>
                                )}
                              </li>
                            ))}
                          </ul>

                          {/* Enhanced Learning Button */}
                          {selectedSection.extraStudy && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowExtraStudy(true)}
                              className="mt-12 w-full p-6 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-between group shadow-2xl shadow-indigo-500/20 transition-all border border-white/10"
                            >
                              <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-white/10 rounded-2xl group-hover:rotate-12 transition-transform">
                                  <Sparkles size={24} />
                                </div>
                                <div>
                                  <p className="font-black text-sm tracking-tight">{selectedSection.extraStudy.buttonLabel}</p>
                                  <p className="text-[10px] opacity-70 font-black uppercase tracking-widest">{selectedSection.extraStudy.buttonLabelAr}</p>
                                </div>
                              </div>
                              <ChevronRight size={20} />
                            </motion.button>
                          )}
                        </motion.div>

                        {/* Common Confusion */}
                        {selectedSection.confusionWarning && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-10 rounded-[3.5rem] bg-rose-500/5 border border-rose-500/10 backdrop-blur-md shadow-2xl col-span-1 md:col-span-2"
                          >
                            <h4 className="flex items-center gap-4 text-white font-black mb-10 text-xl tracking-tight">
                              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                                <AlertOctagon size={24} />
                              </div>
                              Confusion Warning
                            </h4>
                            <div className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 space-y-6 relative overflow-hidden group">
                              <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/5 blur-[30px]" />
                              <p className="text-rose-100/90 leading-relaxed font-bold text-sm relative z-10">{selectedSection.confusionWarning}</p>
                              {selectedSection.confusionWarningAr && (
                                <p className="text-rose-400/80 text-xs text-right font-black border-t border-rose-500/20 pt-6 relative z-10">{selectedSection.confusionWarningAr}</p>
                              )}
                            </div>
                            
                            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                              <button 
                                onClick={() => {
                                  // 1. Try to find specimen in confusion warning text
                                  const match = selectedSection.confusionWarning?.match(/with\s+([A-Za-z\s-]+)/i);
                                  let found = match ? findSampleByName(match[1].trim()) : null;
                                  
                                  // 2. Fallback: Search all words in warning
                                  if (!found) {
                                    const words = selectedSection.confusionWarning?.split(" ") || [];
                                    found = words.map(w => findSampleByName(w)).find(f => f !== null) || null;
                                  }

                                  // 3. Category Fallback: Find any sibling in the same category
                                  if (!found && activeParent?.subSections) {
                                    found = activeParent.subSections.find(s => s.id !== selectedSection.id) || null;
                                  }

                                  if (found) setComparisonSample(found);
                                }}
                                className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black uppercase tracking-widest text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-500/5 flex items-center justify-center gap-3"
                              >
                                <Sparkles size={16} />
                                Analyze Differences Side-by-Side
                              </button>
                              
                              <StudyGuideExporter section={selectedSection} />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ENHANCED LEARNING MODAL (Layers, etc) */}
      <AnimatePresence>
        {showExtraStudy && selectedSection?.extraStudy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[#020617]/95 backdrop-blur-3xl flex items-center justify-center p-6 lg:p-12"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="max-w-6xl w-full bg-slate-900/50 rounded-[4rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col lg:grid lg:grid-cols-2"
            >
              <div className="relative group overflow-hidden bg-black flex items-center justify-center p-12">
                <img 
                  src={selectedSection.extraStudy.imageUrl} 
                  alt={selectedSection.extraStudy.title}
                  className="max-w-full max-h-[70vh] object-contain transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-8 left-8 flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <Sparkles size={14} /> Enhanced View
                </div>
              </div>

              <div className="p-12 lg:p-20 flex flex-col justify-center bg-slate-900/40 backdrop-blur-md border-l border-white/5">
                <div className="flex justify-end mb-8">
                  <button 
                    onClick={() => setShowExtraStudy(false)}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <header className="mb-12">
                  <h2 className="text-4xl font-black text-white tracking-tighter mb-4">{selectedSection.extraStudy.title}</h2>
                  {selectedSection.extraStudy.titleAr && (
                    <p className="text-2xl font-black text-indigo-500/60 mb-8">{selectedSection.extraStudy.titleAr}</p>
                  )}
                </header>

                <div className="space-y-8">
                  <p className="text-slate-300 text-lg leading-relaxed font-medium">
                    {selectedSection.extraStudy.content}
                  </p>
                  {selectedSection.extraStudy.contentAr && (
                    <p className="text-slate-500 text-right text-sm font-bold border-r-4 border-indigo-500/20 pr-6 leading-relaxed">
                      {selectedSection.extraStudy.contentAr}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => setShowExtraStudy(false)}
                  className="mt-16 w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-xl shadow-white/5"
                >
                  Return to Atlas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<MicroscopeLoader />}>
      <StudyContent />
    </Suspense>
  );
}
