import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          De Kast
        </h1>
        <nav className="mt-8 flex flex-col gap-4">
          <Link
            href="/check-in"
            className="rounded-xl border-2 border-zinc-300 py-5 text-center text-xl font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Inchecken
          </Link>
          <Link
            href="/abonnement"
            className="rounded-xl border-2 border-zinc-300 py-5 text-center text-xl font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Mijn abonnement
          </Link>
          <Link
            href="/beheer"
            className="rounded-xl border-2 border-zinc-300 py-5 text-center text-xl font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Beheer
          </Link>
        </nav>
      </div>
    </main>
  );
}
