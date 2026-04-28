import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { getLastActivityPath } from "@/services/adaptiveLearningService";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;
  const session = await auth();

  if (session?.user?.id) {
    const lastActivity = await getLastActivityPath(session.user.id);
    redirect(lastActivity ?? "/study");
  }

  return (
    <main className="mx-auto min-h-screen px-4 py-10 lg:max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl ring-1 ring-white/10">
          <p className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
            تسجيل دخول الطالب
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">ابدأ امتحانك العملي بثقة</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            سجل الدخول باستخدام رقم الجامعة لمتابعة محتوى الدراسة، المراجعات المخصصة، والاختبارات بظروف قريبة من الامتحان الحقيقي.
          </p>

          <div className="mt-10 grid gap-4 rounded-[2rem] bg-slate-900/80 p-6 ring-1 ring-white/10">
            <div className="rounded-3xl bg-slate-800 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">أهم المميزات</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>✔ واجهة مرنة بسرعة في الدخول والمراجعة.</li>
                <li>✔ سؤال تلو الآخر مع تقييم شامل للأخطاء.</li>
                <li>✔ تركيز أكبر على الاختلافات بين العينات.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-slate-800 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">نصيحة سريعة</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                في الامتحان العملي، ابحث أولاً عن نمط الأنسجة ثم انظر إلى تفاصيل الألوان والنواة.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 space-y-3">
            <h2 className="text-3xl font-semibold text-slate-900">Login to your account / تسجيل الدخول</h2>
            <p className="text-sm text-slate-600">
              Use your university ID and password to continue. Your progress and review history will be saved.
            </p>
            <p className="text-sm text-slate-600">
              استخدم رقم الجامعة وكلمة المرور لحفظ تقدمك ومتابعة المراجعات.
            </p>
          </div>

          <form action={loginAction} className="space-y-5" suppressHydrationWarning>
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/study"} />
            <div>
              <label htmlFor="universityId" className="mb-2 block text-sm font-medium text-slate-700">
                University ID / رقم الجامعة
              </label>
              <input
                id="universityId"
                name="universityId"
                required
                placeholder="ASU-1001"
                suppressHydrationWarning
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password / كلمة المرور
                </label>
                <a href="/forgot-password" title="Coming soon" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password? / نسيت كلمة المرور؟
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                suppressHydrationWarning
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              className="w-full rounded-2xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Log In / دخول
            </button>
          </form>

          {error ? (
            <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 animate-in fade-in slide-in-from-top-2">
              <p className="font-bold mb-1">Login Failed / فشل تسجيل الدخول</p>
              <p>Invalid ID or password. If you just registered, ensure you are using the correct credentials.</p>
              <p className="mt-1">الرقم الجامعي أو كلمة المرور غير صحيحة. تأكد من البيانات التي سجلت بها.</p>
            </div>
          ) : null}

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-indigo-700 hover:text-indigo-800">
              Sign up
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

async function loginAction(formData: FormData) {
  "use server";

  const universityId = String(formData.get("universityId") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/study");

  try {
    await signIn("credentials", {
      universityId,
      password,
      redirectTo: callbackUrl
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=CredentialsSignin");
    }
    throw error;
  }
}
