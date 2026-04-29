import { auth } from "@/auth";
import { handleSignOut } from "@/lib/actions/authActions";

export async function UserProfileBar() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">Logged in as / مسجل دخول كـ</p>
        <p className="text-sm font-semibold text-slate-900">
          {session.user.name ?? session.user.email ?? session.user.id} ({session.user.id})
        </p>
      </div>

      <form action={handleSignOut}>
        <button
          type="submit"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Logout / تسجيل خروج
        </button>
      </form>
    </div>
  );
}
