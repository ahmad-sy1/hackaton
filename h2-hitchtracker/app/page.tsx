import { connection } from "next/server";
import { getPickupPoints } from "@/src/server/ride-estimate/queries";
import { EstimateForm } from "./_components/EstimateForm";

export default async function StartPage() {
  // The pick-up points come from the database, so render per request.
  await connection();
  const pickupPoints = await getPickupPoints();

  return (
    <div className="mx-auto max-w-3xl pt-16">
      <h1 className="text-4xl font-bold tracking-tight">
        Waar wil je naartoe?
      </h1>
      <EstimateForm pickupPoints={pickupPoints} />
    </div>
  );
}
