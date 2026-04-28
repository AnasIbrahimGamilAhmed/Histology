type FeatureListProps = {
  title?: string;
  features: string[];
};

export function FeatureList({ title = "Key Features", features }: FeatureListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
  );
}
