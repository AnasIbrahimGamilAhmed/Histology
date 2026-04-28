"use client";

import { useState, useRef, useEffect } from "react";
import type { StudySample } from "@/lib/sampleService";

type MicroscopySimulatorProps = {
  variations: StudySample["variations"];
  sampleName: string;
};

export function MicroscopySimulator({ variations, sampleName }: MicroscopySimulatorProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const target = variations[0];
  if (!target) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(1, Math.min(4, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomBtn = (factor: number) => {
    setZoom((prev) => Math.max(1, Math.min(4, prev + factor)));
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const practicalGuides = {
    "Simple squamous epithelium": "ابحث عن: خلايا مفلطحة جداً، نواة مركزية بيضاوية. الخطأ الشائع: الخلط مع بطانة الأوعية الدموية (endothelium) - لكن الفرق في سمك الجدار.",
    "Hyaline cartilage": "ابحث عن: الفراغات المحفورة (lacunae) بها خلايا، مصفوفة متجانسة زرقاء. الخطأ الشائع: الخلط مع الغضروف المرن - هنا لا توجد ألياف مرنة واضحة.",
    "Skeletal muscle": "ابحث عن: الخطوط المتقاطعة (striations) واضحة جداً، نوى محيطية. الخطأ الشائع: الخلط مع العضلة الملساء - الملساء ليس بها خطوط.",
    "Compact bone": "ابحث عن: الأنظمة (osteons) و القنوات المركزية (Haversian canals)، الصفائح المركزة. الخطأ الشائع: الخلط مع العظم الإسفنجي - المضغوط أكثر تنظيماً.",
    "Liver lobule": "ابحث عن: الوريد المركزي (central vein) في المنتصف، الصفائح الكبدية متشعة. الخطأ الشائع: الخلط مع البنكرياس - عن أورية مركزية مميزة جداً."
  };

  const guide = practicalGuides[sampleName as keyof typeof practicalGuides] || "";

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">محاكاة مجهر متقدمة / Advanced Microscopy Sim</h3>
          <p className="mt-1 text-sm text-slate-600">استخدم العجلة للتكبير، اسحب بالماوس للحركة في الصورة</p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
          تفاعلي / Interactive
        </span>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-96 w-full overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-900 cursor-grab active:cursor-grabbing"
      >
        <img
          src={target.image}
          alt={`${sampleName} microscopy`}
          className="absolute inset-0 h-full w-full object-contain transition-none"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: "center"
          }}
          draggable={false}
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-sm opacity-50">
          {zoom.toFixed(1)}x
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleZoomBtn(0.2)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + Zoom
        </button>
        <button
          onClick={() => handleZoomBtn(-0.2)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          - Zoom
        </button>
        <button
          onClick={resetView}
          className="rounded-lg bg-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-400 transition-colors"
        >
          Reset View
        </button>
      </div>

      {guide && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 نصيحة عملية / Practical Tip:</h4>
          <p className="text-sm text-blue-800 leading-6">{guide}</p>
        </div>
      )}
    </section>
  );
}
