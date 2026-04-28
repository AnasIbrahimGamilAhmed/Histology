import Link from "next/link";
import type { StudySample } from "@/lib/sampleService";

type SampleCardProps = {
  sample: Pick<StudySample, "id" | "name" | "description" | "variations">;
  indicator?: "Weak" | "Strong" | "Needs Review";
  materialNumber?: number;
  totalMaterials?: number;
};

const indicatorClasses: Record<NonNullable<SampleCardProps["indicator"]>, string> = {
  Weak: "bg-rose-100 text-rose-700",
  Strong: "bg-emerald-100 text-emerald-700",
  "Needs Review": "bg-amber-100 text-amber-700"
};

export function SampleCard({ sample, indicator, materialNumber, totalMaterials }: SampleCardProps) {
  return (
    <Link
      href={`/study/${sample.id}`}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {materialNumber && totalMaterials && (
        <p className="text-xs text-slate-500">Material {materialNumber} of {totalMaterials}</p>
      )}
      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">{sample.name}</h2>
      {indicator ? (
        <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${indicatorClasses[indicator]}`}>
          {indicator}
        </span>
      ) : null}
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{sample.description}</p>
      <p className="mt-4 text-sm font-medium text-indigo-700">
        {sample.variations.length} variation{sample.variations.length === 1 ? "" : "s"} / تغير
      </p>
    </Link>
  );
}

