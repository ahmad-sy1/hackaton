import { notFound } from "next/navigation";
import { formatEuro } from "@/src/lib/money";
import { formatDistanceKm, formatDurationMinutes } from "@/src/lib/units";
import { getRideById } from "@/src/server/ride-estimate/queries";
import { CopyLink } from "./_components/CopyLink";

export default async function RidePage({ params }: PageProps<"/ride/[id]">) {
  const { id } = await params;
  const ride = await getRideById(id);
  if (ride === null) notFound();

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
    </div>
  );
}
