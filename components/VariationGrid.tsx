import type { StudySample } from "@/lib/sampleService";

const variationTypeLabel: Record<StudySample["variations"][number]["type"], string> = {
  stain_variation: "Stain Variation / تباين الصبغة",
  magnification_variation: "Magnification Variation / تباين التكبير",
  section_variation: "Section Variation / تباين القطعة",
  region_variation: "Region Variation / تباين المنطقة",
  exam_tricky_view: "Exam Tricky View / منظر امتحاني صعب"
};

const variationTypeDetail: Record<StudySample["variations"][number]["type"], string> = {
  stain_variation: "Learn how staining changes the tissue contrast and highlights nuclei.",
  magnification_variation: "Observe how zoom level alters the visible architecture.",
  section_variation: "See how different cuts expose tissue organization and edges.",
  region_variation: "Compare distinct microscope fields from the same sample.",
  exam_tricky_view: "Practice identifying the sample under a challenging exam-like view."
};

const variationOrder: StudySample["variations"][number]["type"][] = [
  "stain_variation",
  "magnification_variation",
  "section_variation",
  "region_variation",
  "exam_tricky_view"
];

type VariationGridProps = {
  variations: StudySample["variations"];
  sampleName: string;
};

export function VariationGrid({ variations, sampleName }: VariationGridProps) {
  return (
    <section className="space-y-8">
      {variationOrder.map((type) => {
        const typeVariations = variations.filter((variation) => variation.type === type);
        if (typeVariations.length === 0) {
          return null;
        }

        return (
          <div key={type} className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{variationTypeLabel[type]}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {typeVariations.map((variation) => (
                <article key={variation.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <img
                    src={variation.image}
                    alt={`${sampleName} - ${variationTypeLabel[type]}`}
                    className="h-auto w-full rounded-lg border border-slate-100 object-cover"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-800">{variationTypeLabel[type]}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{variationTypeDetail[type]}</p>
                  {variation.notes ? <p className="mt-3 text-sm text-slate-600">{variation.notes}</p> : null}
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
