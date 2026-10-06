import Link from "next/link";
import { notFound } from "next/navigation";
import { formatEuro, formatEuroDifference } from "@/src/lib/money";
import {
  formatDistanceKm,
  formatDurationMinutes,
  formatMinutes,
} from "@/src/lib/units";
import { completeRideDemo } from "@/src/server/ride-completion/actions";
import { compareWithEstimate } from "@/src/server/ride-completion/ride-completion";
import type { DemoScenario } from "@/src/server/ride-completion/ride-completion.types";
import { getRideById } from "@/src/server/ride-estimate/queries";
import type { RideSummary } from "@/src/server/ride-estimate/ride-estimate.types";
import { CopyLink } from "./_components/CopyLink";

export default async function RidePage({ params }: PageProps<"/ride/[id]">) {
  const { id } = await params;
  const ride = await getRideById(id);
  if (ride === null) notFound();

  // The same link shows the ride in progress (screen 3) and, once the driver
  // has completed it, the final price (screen 4).
  if (
    ride.status === "afgerond" &&
    ride.finalPriceCents !== null &&
    ride.actualDistanceM !== null &&
    ride.actualDurationS !== null
  ) {
    return (
      <CompletedRide
        ride={ride}
        finalPriceCents={ride.finalPriceCents}
        actualDistanceM={ride.actualDistanceM}
        actualDurationS={ride.actualDurationS}
      />
    );
  }

  return <RideInProgress ride={ride} />;
}

function RideInProgress({ ride }: { ride: RideSummary }) {
  const complete = completeRideDemo.bind(null, ride.id);

  return (
    <div className="pt-16">
      <h1 className="flex items-center gap-3 text-4xl font-bold">
        <span aria-hidden className="h-3 w-3 rounded-full bg-zinc-900" />
        Rit is bezig
      </h1>
      <p className="mt-2 text-xl font-semibold">
        {ride.originName} → {ride.destinationName}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div className="rounded-xl bg-zinc-100 p-6">
          <p className="text-sm text-zinc-600">Vastgelegde schatting</p>
          <p className="mt-1 text-4xl font-bold">
            {formatEuro(ride.estimatedPriceCents)}
          </p>
          <p className="mt-2 text-zinc-700">
            {formatDurationMinutes(ride.estimatedDurationS)} ·{" "}
            {formatDistanceKm(ride.estimatedDistanceM)}
          </p>
        </div>

        <CopyLink path={`/ride/${ride.id}`} />
      </div>

      {/* Two scenarios so both outcomes of AC-02.4 can be tested
          ("Haalbaarheid: afbakening" in the design). */}
      <form
        action={complete}
        className="mt-16 flex items-center justify-between rounded-xl border-2 border-dashed border-zinc-400 px-6 py-4"
      >
        <p className="text-sm font-semibold tracking-wide text-zinc-700 uppercase">
          Demo — alleen voor testen
        </p>
        <div className="flex gap-3">
          <DemoButton scenario="normal" label="Rit afronden: normaal" />
          <DemoButton scenario="detour" label="Rit afronden: omweg" />
        </div>
      </form>
    </div>
  );
}

function DemoButton({
  scenario,
  label,
}: {
  scenario: DemoScenario;
  label: string;
}) {
  return (
    <button
      type="submit"
      name="scenario"
      value={scenario}
      className="rounded-lg bg-zinc-200 px-5 py-3 font-semibold text-zinc-800 hover:bg-zinc-300"
    >
      {label} <span className="font-normal">(simulatie chauffeur)</span>
    </button>
  );
}

function CompletedRide({
  ride,
  finalPriceCents,
  actualDistanceM,
  actualDurationS,
}: {
  ride: RideSummary;
  finalPriceCents: number;
  actualDistanceM: number;
  actualDurationS: number;
}) {
  const comparison = compareWithEstimate(
    ride.estimatedPriceCents,
    finalPriceCents,
  );
  const percentSign = comparison.differencePercent < 0 ? "−" : "+";

  return (
    <div className="pt-16">
      <h1 className="text-4xl font-bold">Rit afgerond</h1>
      <p className="mt-2 text-xl text-zinc-700">
        {ride.originName} → {ride.destinationName}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-100 p-5">
              <p className="text-sm text-zinc-600">Schatting</p>
              <p className="mt-1 text-3xl font-bold">
                {formatEuro(ride.estimatedPriceCents)}
              </p>
            </div>
            <div className="rounded-xl border-2 border-zinc-900 p-5">
              <p className="text-sm text-zinc-600">Eindprijs</p>
              <p className="mt-1 text-3xl font-bold">
                {formatEuro(finalPriceCents)}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-2">
            <div className="flex justify-between">
              <dt>Gereden afstand</dt>
              <dd>{formatDistanceKm(actualDistanceM)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Ritduur</dt>
              <dd>{formatMinutes(actualDurationS)}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-300 pt-3 text-lg font-bold">
              <dt>Verschil</dt>
              <dd
                className={
                  comparison.exceedsThreshold ? "text-orange-800" : undefined
                }
              >
                {formatEuroDifference(comparison.differenceCents)} (
                {percentSign}
                {Math.abs(comparison.differencePercent)}%)
              </dd>
            </div>
          </dl>
        </div>

        <div>
          {comparison.exceedsThreshold && (
            <p
              role="alert"
              className="mb-4 rounded-xl border-2 border-orange-400 bg-orange-50 p-5 text-orange-950"
            >
              ⚠{" "}
              <strong>
                De eindprijs is meer dan 20% hoger dan de schatting.
              </strong>{" "}
              Vraag de chauffeur om uitleg, bijvoorbeeld over de gereden route.
            </p>
          )}
          <p className="text-sm text-zinc-700">
            Deze prijs is berekend door HitchTracker, niet ingevoerd door de
            chauffeur.
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-end border-t border-zinc-200 pt-6">
        <Link
          href="/"
          className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Nieuwe rit
        </Link>
      </div>
    </div>
  );
}
