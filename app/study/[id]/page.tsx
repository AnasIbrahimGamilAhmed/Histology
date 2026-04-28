import Link from "next/link";
import { notFound } from "next/navigation";
import { MicroscopySimulator } from "@/components/MicroscopySimulator";
import { VariationGrid } from "@/components/VariationGrid";
import { getComparisonSampleByConfusionTags, getSampleById } from "@/lib/sampleService";

const variationConditionLabels = {
  stain_variation: "Stained / ملون",
  section_variation: "Sectioned / مقطوع",
  magnification_variation: "Magnified / مكبّر",
  region_variation: "Region-specific / منطقة محددة",
  exam_tricky_view: "Exam-view / رؤية امتحانية"
};

const variationConditionHelp = {
  stain_variation: "**الصبغات تغيّر المظهر**: H&E يصبغ النوى أزرق، السيتوبلازم أحمر. إذا شفت لون مختلف، قد تكون صبغة ترايكروم أو PAS. المفتاح: تركيز على الهيكل، لا على اللون.",
  section_variation: "**سمك القطعة مهم**: قطعة رقيقة (5µm) تشوف التفاصيل، قطعة سميكة (50µm) تشوف اكثر أنسجة ملتصقة. إذا الصورة غامقة بالداخل، احتمال قطعة سميكة.",
  magnification_variation: "**التكبير يغيّر المنظور**: 10x تشوف الهيكل العام، 40x تشوف النوى والتفاصيل الدقيقة، 100x تشوف العضيات. البحث أولاً عن الشكل العام، بعدين التفاصيل.",
  region_variation: "**نفس العينة، مناطق مختلفة**: العينة الواحدة فيها مناطق مختلفة. مثلاً الكبد: المنطقة الوسطية فيها وريد مركزي، الطرفية فيها بوابة ثلاثية. تعلم الشكل العام أولاً.",
  exam_tricky_view: "**رؤية امتحانية صعبة**: صور حقيقية من امتحانات، فيها زوايا غريبة وإضاءة غير مثالية. ركّز على الميزات الأساسية الثابتة، لا تخدعك الزوايا الغريبة."
};

export default async function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await getSampleById(id);
  const comparisonSample = sample ? await getComparisonSampleByConfusionTags(id, sample.confusionTags) : null;

  if (!sample) {
    notFound();
  }

  const allVariationTypes = Array.from(new Set(sample.variations.map((variation) => variation.type)));
  const conditionSummary = allVariationTypes.map((type) => variationConditionLabels[type]);
  const conditionHelp = allVariationTypes.map((type) => variationConditionHelp[type]);
  const differenceFeatures = comparisonSample
    ? sample.keyFeatures.filter((feature) => !comparisonSample.keyFeatures.includes(feature))
    : [];
  const commonFeatures = comparisonSample
    ? sample.keyFeatures.filter((feature) => comparisonSample.keyFeatures.includes(feature))
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p>
            <Link href="/study" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
              ← Back to Study
            </Link>
          </p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">{sample.name}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{sample.description}</p>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Microscope conditions / ظروف المجهر</p>
            <p className="mt-2 text-sm text-slate-700">{conditionSummary.join(" · ")}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Study Focus</p>
          <p className="mt-2 text-sm text-slate-700">
            Strengthen recognition by comparing this sample with similar tissues and reviewing your weak zones.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <MicroscopySimulator variations={sample.variations} sampleName={sample.name} />
          <VariationGrid variations={sample.variations} sampleName={sample.name} />
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Key Features</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {sample.keyFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">كيفية التعرف / Recognition Guide</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="leading-6"><strong>الوصف:</strong> {sample.description}</p>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mt-3">
                <p className="font-semibold text-blue-900">👁️ ابحث أولاً عن / Look for first:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-blue-800">
                  {sample.keyFeatures.slice(0, 3).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Common Confusions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {sample.confusionTags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Conditions in this study set</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {conditionHelp.map((helpText) => (
                <li key={helpText} className="flex gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">•</span>
                  <span>{helpText}</span>
                </li>
              ))}
            </ul>
          </div>

          {comparisonSample ? (
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">مقارنة سريعة مع عينة مشابهة / Quick comparison</h2>
              <p className="mt-3 text-sm text-slate-700">
                هذه العينة قد تختلط مع <strong>{comparisonSample.name}</strong>. Focus on the differences below to distinguish them under the microscope.
              </p>
              <div className="mt-5 grid gap-4 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{sample.name}</h3>
                  <p className="mt-2 text-xs text-slate-500">Key features / سمات رئيسية</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {sample.keyFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{comparisonSample.name}</h3>
                  <p className="mt-2 text-xs text-slate-500">Key features / سمات رئيسية</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {comparisonSample.keyFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {commonFeatures.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Shared features / السمات المشتركة</h3>
                  <p className="mt-2 text-sm text-slate-700">{commonFeatures.join(" ، ")}</p>
                </div>
              ) : null}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Distinct features / الفروقات</h3>
                <p className="mt-2 text-sm text-slate-700">
                  {differenceFeatures.length > 0
                    ? differenceFeatures.join(" ، ")
                    : "Focus on the smallest shape, color, and tissue arrangement differences to tell them apart."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Study tip</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Focus first on the main features, then review variations side by side. This helps you remember the subtle differences faster.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}