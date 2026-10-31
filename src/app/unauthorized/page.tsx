import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-6 py-24 text-center text-slate-900">
      <h1 className="text-3xl font-black">Access denied</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
        Your account does not have permission to access this workspace.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-xl bg-[#714B67] px-5 py-3 text-sm font-bold text-white"
      >
        Return to Brightloop
      </Link>
    </main>
  );
}
