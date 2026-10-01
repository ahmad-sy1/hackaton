import Link from "next/link";
import { formatEuro } from "@/src/lib/money";
import { formatDistanceKm, formatDurationMinutes } from "@/src/lib/units";
import { acceptEstimate } from "@/src/server/ride-estimate/actions";
import { getEstimate } from "@/src/server/ride-estimate/queries";

export default async function EstimatePage({
  searchParams,
}: PageProps<"/schatting">) {
  const { van, naar } = await searchParams;
  // Calculated again on every visit: an estimate is never stored before it is
  // accepted (AC-01.4).
  const result = await getEstimate(van, naar);

  if (result.status !== "ok") {
    return (
      <div className="mx-auto max-w-3xl pt-16">
        <h1 className="text-3xl font-bold">Geen schatting mogelijk</h1>
        <p
          role="alert"
          className="mt-4 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-orange-900"
        >
          ⚠ {result.message}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg border-2 border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-50"
        >
          Terug naar start
        </Link>
      </div>
    );
  }

  const { estimate } = result;
  const { tariff } = estimate;
  const accept = acceptEstimate.bind(
    null,
    String(estimate.originId),
    String(estimate.destinationId),
  );

  return (
    <div className="pt-16">
      <h1 className="text-2xl font-semibold">
        {estimate.originName} → {estimate.destinationName}
      </h1>

      <div className="mt-8 flex items-start justify-between gap-12">
        <div>
          <p className="text-sm text-zinc-600">Verwachte prijs</p>
          <p className="mt-1 text-6xl font-bold tracking-tight">
            ± {formatEuro(estimate.priceCents)}
          </p>
          <p className="mt-2 text-lg text-zinc-700">
            {formatDurationMinutes(estimate.durationS)} ·{" "}
            {formatDistanceKm(estimate.distanceM)}
          </p>
        </div>

        <div className="w-80">
          <dl className="rounded-xl bg-zinc-100 p-4 text-sm">
            <dt className="font-semibold">
              Gebruikt tarief ({tariff.cityName})
            </dt>
            <dd className="mt-2 space-y-1">
              <TariffRow label="Starttarief" cents={tariff.startFeeCents} />
              <TariffRow label="Per km" cents={tariff.perKmCents} />
              <TariffRow label="Per minuut" cents={tariff.perMinuteCents} />
            </dd>
          </dl>
          <p className="mt-3 text-sm text-zinc-700">
            De eindprijs wordt met dit tarief berekend.
          </p>
        </div>
      </div>

      <form
        action={accept}
        className="mt-10 flex justify-end gap-4 border-t border-zinc-200 pt-6"
      >
        <Link
          href="/"
          className="rounded-lg border-2 border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-50"
        >
          Terug
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Schatting accepteren
        </button>
      </form>
    </div>
  );
}

function TariffRow({ label, cents }: { label: string; cents: number }) {
  return (
    <span className="flex justify-between">
      <span>{label}</span>
      <span>{formatEuro(cents)}</span>
    </span>
  );
}
