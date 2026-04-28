import Image from "next/image";
import type { Variation, VariationType } from "@prisma/client";

const variationTypeLabel: Record<VariationType, string> = {
  stain_variation: "Stain Variation",
  section_variation: "Section Variation",
  magnification_variation: "Magnification Variation",
  region_variation: "Region Variation",
  exam_tricky_view: "Exam Tricky View"
};

type VariationViewerProps = {
  variations: Variation[];
  sampleName: string;
};

export function VariationViewer({ variations, sampleName }: VariationViewerProps) {
  return (
    <section>
      <h3>Variation Gallery</h3>
      {variations.map((variation) => (
        <article key={variation.id} className="card" style={{ marginBottom: 12 }}>
          <span className="badge">{variationTypeLabel[variation.type]}</span>
          <Image
            src={variation.image}
            width={900}
            height={500}
            alt={`${sampleName} - ${variationTypeLabel[variation.type]}`}
            className="viewer-image"
          />
          {variation.notes ? <p className="muted">{variation.notes}</p> : null}
        </article>
      ))}
    </section>
  );
}

