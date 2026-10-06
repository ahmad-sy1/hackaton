"use server";

import { notFound, redirect } from "next/navigation";
import { isRideId } from "../ride-estimate/ride-estimate";
import { completeRide } from "./queries";
import { parseScenario } from "./ride-completion";

/**
 * Demo button on the ride screen, standing in for the driver. Only the
 * scenario is sent; distance, duration and price are decided on the server.
 */
export async function completeRideDemo(
  rideId: string,
  formData: FormData,
): Promise<void> {
  // Both values reach the server from the browser and can be tampered with.
  if (!isRideId(rideId)) notFound();
  const scenario = parseScenario(formData.get("scenario"));
  // Either way the ride screen shows the stored state, so the result needs no
  // message of its own.
  if (scenario !== null) await completeRide(rideId, scenario);

  redirect(`/ride/${rideId}`);
}
