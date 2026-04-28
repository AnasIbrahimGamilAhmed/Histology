"use client";

import { useState } from "react";
import { histologyData, TissueSection } from "@/lib/data/histologyData";
import Link from "next/link";
import { ChevronRight, ChevronDown, Microscope, Lightbulb, BookOpen, Brain, ArrowLeft, AlertOctagon, Image as ImageIcon, Sparkles, Search } from "lucide-react";

export default function StudyPage() {
  const [selectedSection, setSelectedSection] = useState<TissueSection | null>(null);
  const [activeParent, setActiveParent] = useState<TissueSection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = histologyData.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.titleAr && cat.titleAr.includes(searchQuery)) ||
    cat.subSections?.some(sub => 
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.titleAr && sub.titleAr.includes(searchQuery))
    )
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Histology Navigator
              </h1>
              <p className="mt-4 text-slate-400 text-lg max-w-2xl">
                Explore the cellular architecture of the human body. Select a category or search for a specimen.
              </p>
            </div>
            {!activeParent && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-white outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            )}
            <Link 
              href="/exam" 
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <Brain size={20} />
              <span>Test Knowledge</span>
            </Link>
          </div>
        </header>

        {!activeParent ? (
          /* CATEGORY GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredData.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveParent(category)}
                className="group p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 backdrop-blur-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  {category.title}
                  {category.titleAr && <span className="text-sm font-black text-slate-500 ml-2">{category.titleAr}</span>}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm mb-4">
                  {category.description}
                </p>
                {category.descriptionAr && <p className="text-slate-500 text-xs italic mb-6 text-right leading-relaxed">{category.descriptionAr}</p>}
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  View {category.subSections?.length || 0} Sub-sections <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* SUB-SECTION SELECTOR & CONTENT VIEW */
          <div className="flex flex-col lg:grid lg:grid-cols-[350px_1fr] gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Sidebar List */}
            <aside className="space-y-4">
              <button 
                onClick={() => { setActiveParent(null); setSelectedSection(null); }}
                className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors mb-6"
              >
                <ArrowLeft size={18} /> Back to Categories
              </button>
              
              <div className="p-2 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <h2 className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-2 flex justify-between items-center">
                  <span>{activeParent.title}</span>
                  <span className="text-[10px] font-black text-slate-600">{activeParent.titleAr}</span>
                </h2>
                <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {activeParent.subSections?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSection(sub)}
                      className={`w-full flex flex-col p-4 rounded-2xl text-left transition-all ${
                        selectedSection?.id === sub.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm">{sub.title}</span>
                        <ChevronRight size={16} className={selectedSection?.id === sub.id ? "opacity-100" : "opacity-0"} />
                      </div>
                      {sub.titleAr && <span className={`text-[10px] font-bold mt-1 ${selectedSection?.id === sub.id ? "text-indigo-200" : "text-slate-600"}`}>{sub.titleAr}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <section className="min-h-[500px]">
              {!selectedSection ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-[3rem] border-2 border-dashed border-slate-800 bg-slate-900/20">
                  <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mb-6">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Select a Sample</h3>
                  <p className="text-slate-400 max-w-xs">Pick a specific specimen from the list to view its microscopic characteristics and identification tips.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <header className="mb-8">
                    <h2 className="text-4xl font-black text-white mb-2 flex items-baseline gap-4">
                      {selectedSection.title}
                      {selectedSection.titleAr && <span className="text-xl font-black text-indigo-500/60">{selectedSection.titleAr}</span>}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">{selectedSection.description}</p>
                    {selectedSection.descriptionAr && <p className="text-slate-500 italic mt-2 text-sm">{selectedSection.descriptionAr}</p>}
                  </header>

                  {/* Image Gallery */}
                  {selectedSection.imageUrls && selectedSection.imageUrls.length > 0 && (
                    <div className="mb-10">
                      <div className={`grid gap-6 ${selectedSection.imageUrls.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                        {selectedSection.imageUrls.map((url, idx) => (
                          <div key={idx} className="relative group rounded-[2rem] overflow-hidden border border-slate-800 bg-black shadow-2xl">
                            <img 
                              src={url} 
                              alt={`${selectedSection.title} view ${idx + 1}`}
                              className="w-full h-[350px] object-contain transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent backdrop-blur-[2px] text-[10px] uppercase tracking-widest font-black text-slate-300 border-t border-white/5 flex justify-between items-center">
                              <span>{url.toLowerCase().includes("micro") ? "Microscope View" : "Overview"} </span>
                              <span className="text-indigo-400">Verified Specimen</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Practical Tips */}
                    <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-sm">
                      <h4 className="flex items-center gap-3 text-emerald-400 font-bold mb-6 text-lg">
                        <Microscope size={22} />
                        Practical Identification | التعرف العملي
                      </h4>
                      <ul className="space-y-4">
                        {selectedSection.practicalTips?.map((tip, idx) => (
                          <li key={idx} className="flex flex-col gap-1 group">
                            <div className="flex items-start gap-3 text-emerald-100/80">
                              <div className="mt-1 p-1 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Lightbulb size={14} />
                              </div>
                              <span className="leading-relaxed font-medium">{tip}</span>
                            </div>
                            {selectedSection.practicalTipsAr?.[idx] && (
                              <p className="text-emerald-500/60 text-xs mr-6 text-right font-bold">{selectedSection.practicalTipsAr[idx]}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Confusion */}
                    {selectedSection.confusionWarning && (
                      <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 backdrop-blur-sm">
                        <h4 className="flex items-center gap-3 text-rose-400 font-bold mb-6 text-lg">
                          <AlertOctagon size={22} />
                          Common Confusion | اللبس الشائع
                        </h4>
                        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                          <p className="text-rose-100/90 leading-relaxed font-medium">{selectedSection.confusionWarning}</p>
                          {selectedSection.confusionWarningAr && (
                            <p className="text-rose-400/80 text-sm text-right font-black border-t border-rose-500/10 pt-3">{selectedSection.confusionWarningAr}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
