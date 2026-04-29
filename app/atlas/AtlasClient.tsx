"use client";

import { useState, useRef, useEffect } from "react";
import { Microscope, Search, Info, ZoomIn, ArrowLeft, X, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

type SampleWithVariations = {
  id: string;
  name: string;
  description: string;
  variations: {
    id: string;
    image: string;
    notes: string | null;
  }[];
};

export default function AtlasClient({ samples }: { samples: SampleWithVariations[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredSamples = samples.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 pb-20">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
                Histology <span className="text-indigo-500">Tree</span>
              </h1>
              <p className="mt-4 text-slate-400 text-lg max-w-2xl">
                Explore high-resolution microscopic specimens with the <span className="text-white font-bold">Smart Magnifier</span>. Perfect for clinical diagnosis training.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-[2rem] backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Microscope size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Database Status</p>
                <p className="text-sm font-bold text-white">{samples.length} Core Specimens</p>
              </div>
            </div>
          </div>
        </header>

        {/* Search & Filter */}
        <div className="relative mb-16 max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search tissue, organ, or specific feature..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-[2.5rem] py-5 pl-14 pr-6 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all backdrop-blur-xl text-lg"
          />
        </div>

        {/* Tree Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSamples.map((sample) => (
            sample.variations.map((variation) => (
              <button 
                key={variation.id} 
                onClick={() => setSelectedImage(variation.image)}
                className="group relative flex flex-col bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 animate-in fade-in zoom-in-95 duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img 
                    src={variation.image} 
                    alt={sample.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-tighter text-white">
                    {variation.notes?.includes("Magnification") ? "High Power" : "Diagnostic view"}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-indigo-600/10 backdrop-blur-[2px]">
                    <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                      <ZoomIn size={28} />
                    </div>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors leading-tight">
                    {sample.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                    {sample.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Ready for Study
                    </span>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))
          ))}
        </div>
      </main>

      {/* Magnifier Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col lg:flex-row items-stretch bg-[#020617]/98 backdrop-blur-3xl animate-in fade-in duration-500"
          onClick={() => setSelectedImage(null)}
        >
          {/* Main Microscope View */}
          <div className="flex-1 relative flex items-center justify-center p-4 lg:p-12">
            <button  type ="button" aria-label="Back" className="absolute top-8 left-8 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[110] border border-white/10" onClick={() => setSelectedImage(null)}>
              <ArrowLeft size={28} />
            </button>

            <div 
              className="relative w-full h-full max-w-6xl flex items-center justify-center bg-black rounded-[3rem] border border-slate-800/50 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PreciseMagnifier src={selectedImage} />
            </div>
          </div>

          {/* Diagnostic Sidebar */}
          <div 
            className="w-full lg:w-[450px] bg-slate-950/50 border-t lg:border-t-0 lg:border-l border-slate-800 p-10 flex flex-col overflow-y-auto custom-scrollbar backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const sample = samples.find(s => s.variations.some(v => v.image === selectedImage));
              return (
                <>
                  <header className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="px-4 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">Scientific Tree</div>
                      <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Verified View</div>
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight mb-4">{sample?.name}</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">{sample?.description}</p>
                  </header>

                  <div className="space-y-8">
                    <div className="p-7 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Info size={64} />
                      </div>
                      <h4 className="flex items-center gap-2 text-indigo-400 font-black mb-4 uppercase tracking-widest text-xs">
                        Diagnostic Criteria / نصائح عملية
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                          <p className="text-slate-200 text-sm leading-relaxed">
                            {sample?.variations.find(v => v.image === selectedImage)?.notes || "Explore the characteristic architecture of this specimen at 3x magnification."}
                          </p>
                        </li>
                        <li className="flex gap-4">
                          <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                          <p className="text-slate-200 text-sm leading-relaxed">
                            لاحظ بوضوح ترتيب الخلايا والأنوية تحت التكبير العالي.
                          </p>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Quick Navigation</p>
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="w-full py-5 rounded-[1.5rem] bg-white text-black font-black text-sm hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-3 group"
                      >
                        Return to Gallery
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-12 p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 font-medium italic">
                      "Use the magnifier lens to identify nuclei patterns and extracellular matrix details essential for diagnostic accuracy."
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function PreciseMagnifier({ src }: { src: string }) {
  const [lens, setLens] = useState({ x: 0, y: 0, show: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current || !imgRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const mouseX = clientX - imgRect.left;
    const mouseY = clientY - imgRect.top;

    if (mouseX >= 0 && mouseX <= imgRect.width && mouseY >= 0 && mouseY <= imgRect.height) {
      setLens({ 
        x: clientX - containerRect.left, 
        y: clientY - containerRect.top, 
        show: true 
      });
    } else {
      setLens(prev => ({ ...prev, show: false }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => updatePosition(e.clientX, e.clientY);
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  const getBackgroundPos = () => {
    if (!imgRef.current) return "0% 0%";
    const imgRect = imgRef.current.getBoundingClientRect();
    const xPct = ((lens.x - (imgRef.current.offsetLeft)) / imgRect.width) * 100;
    const yPct = ((lens.y - (imgRef.current.offsetTop)) / imgRect.height) * 100;
    return `${xPct}% ${yPct}%`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full cursor-none flex items-center justify-center overflow-hidden bg-slate-950"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }}
      onMouseLeave={() => setLens(prev => ({ ...prev, show: false }))}
      onTouchEnd={() => setLens(prev => ({ ...prev, show: false }))}
    >
      <img 
        ref={imgRef}
        src={src} 
        className="max-w-full max-h-full object-contain pointer-events-none shadow-2xl transition-all"
        alt="Clinical specimen"
      />

      {lens.show && imgRef.current && (
        <div 
          className="absolute pointer-events-none w-80 h-80 rounded-full border-[6px] border-white/50 shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(0,0,0,0.4)] z-50 overflow-hidden"
          style={{
            left: lens.x - 160,
            top: lens.y - 160,
            backgroundImage: `url(${src})`,
            backgroundPosition: getBackgroundPos(),
            backgroundSize: `${imgRef.current.width * 3}px ${imgRef.current.height * 3}px`,
            backgroundRepeat: "no-repeat"
          }}
        >
          {/* Microscope Viewport Details */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-[1px] bg-white/20" />
            <div className="h-12 w-[1px] bg-white/20" />
            <div className="w-2 h-2 rounded-full border border-white/20" />
          </div>
          {/* Glass glare effect */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
        </div>
      )}

      {!lens.show && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-bounce">
            <Search size={32} className="text-white/20" />
          </div>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Hover to enter microscope view</p>
        </div>
      )}
    </div>
  );
}
