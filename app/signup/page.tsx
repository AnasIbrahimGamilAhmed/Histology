import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

type SignupPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, success } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl ring-1 ring-white/10">
          <p className="inline-flex items-center rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
            Student registration
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
            Build your histology expertise with a secure account.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Register once to keep your progress, personalize exam practice, and focus on the samples where you need the most improvement.
          </p>

          <div className="mt-10 space-y-4 rounded-3xl bg-slate-900/80 p-6 ring-1 ring-white/10">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-semibold text-white">✓</span>
              <div>
                <h2 className="text-sm font-semibold text-white">Smart practice</h2>
                <p className="mt-1 text-sm text-slate-400">Adaptive questions based on your weak areas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-500 text-sm font-semibold text-white">★</span>
              <div>
                <h2 className="text-sm font-semibold text-white">Professional learning flow</h2>
                <p className="mt-1 text-sm text-slate-400">Clear, modern interface for focused study and review.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500 text-sm font-semibold text-white">⚡</span>
              <div>
                <h2 className="text-sm font-semibold text-white">Fast access</h2>
                <p className="mt-1 text-sm text-slate-400">Get started quickly with a simple student account.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">Create your account / أنشئ حسابك</h2>
            <p className="text-sm text-slate-600">Complete the form below and start using the platform immediately.</p>
            <p className="text-sm text-slate-600">أكمل النموذج أدناه وابدأ استخدام المنصة فوراً.</p>
            <p className="text-sm text-slate-500">ابدأ رحلة التعلم العملي الآن وارتقِ بمستوى تمييزك في المجهر.</p>
          </div>

          {success && (
            <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
              Account created successfully! Please log in.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
              {error === "EmailExists"
                ? "Email already registered. Please use a different email or log in. / الإيميل مسجل بالفعل."
                : error === "UniversityIdExists"
                  ? "University ID already exists. Use a different ID."
                  : error === "PasswordMismatch"
                    ? "Passwords do not match."
                    : error === "PasswordTooShort"
                      ? "Password is too short. Use at least 6 characters."
                      : error === "MissingFields"
                        ? "Please complete all required fields."
                        : error === "OAuthFailed"
                          ? "OAuth signup failed. Please try again. / فشل التسجيل عبر Google/Microsoft."
                          : "Registration failed. Please try again."}
            </div>
          )}

          <form action={registerAction} className="space-y-5" suppressHydrationWarning>
            <div>
              <label htmlFor="universityId" className="mb-2 block text-sm font-medium text-slate-700">
                University ID *
              </label>
              <input
                id="universityId"
                name="universityId"
                required
                placeholder="ASU-1001"
                pattern="[A-Z]{3}-\d{4}"
                title="Format: ABC-1234"
                suppressHydrationWarning
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <p className="mt-2 text-xs text-slate-500">Format: ABC-1234, 3 uppercase letters, dash, 4 digits.</p>
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="John Doe"
                suppressHydrationWarning
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                suppressHydrationWarning
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <p className="mt-2 text-xs text-slate-500">Optional but useful for password recovery and notifications.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create a password"
                  suppressHydrationWarning
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter password"
                  suppressHydrationWarning
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              className="w-full rounded-2xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800"
            >
              Create Account / إنشاء الحساب
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
            <span className="text-xs text-center text-slate-500 uppercase font-semibold">Or sign up with</span>
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <form action={async () => { "use server"; const { cookies } = await import("next/headers"); const cookieStore = await cookies(); cookieStore.set("oauth_signup", "true", { path: "/", maxAge: 300, httpOnly: true }); const { signIn } = await import("@/auth"); await signIn("google", { redirectTo: "/study" }) }}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                🌐 Google
              </button>
            </form>
            <form action={async () => { "use server"; const { cookies } = await import("next/headers"); const cookieStore = await cookies(); cookieStore.set("oauth_signup", "true", { path: "/", maxAge: 300, httpOnly: true }); const { signIn } = await import("@/auth"); await signIn("microsoft-entra-id", { redirectTo: "/study" }) }}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00a4ef] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0089c7] transition">
                🪟 Microsoft
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <a href="/login" className="font-medium text-indigo-700 hover:text-indigo-800">Sign in</a>
          </p>
        </section>
      </div>
    </main>
  );
}

async function registerAction(formData: FormData) {
  "use server";

  const universityId = String(formData.get("universityId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // Validation
  if (!universityId || !name || !password) {
    return redirect("/signup?error=MissingFields");
  }

  if (password !== confirmPassword) {
    return redirect("/signup?error=PasswordMismatch");
  }

  if (password.length < 6) {
    return redirect("/signup?error=PasswordTooShort");
  }

  const existingById = await prisma.studentAccount.findUnique({
    where: { universityId }
  });

  if (existingById) {
    return redirect("/signup?error=UniversityIdExists");
  }

  if (email) {
    const existingByEmail = await prisma.studentAccount.findUnique({
      where: { email }
    });

    if (existingByEmail) {
      return redirect("/signup?error=EmailExists");
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.studentAccount.create({
        data: {
          universityId,
          name,
          email,
          password
        }
      });

      // Initialize progress record for the new student
      await tx.userProgress.create({
        data: {
          userId: universityId,
          weakSamples: []
        }
      });
    });

    return signIn("credentials", {
      universityId,
      password,
      redirectTo: "/study"
    });
  } catch {
    return redirect("/signup?error=CreationFailed");
  }
}
