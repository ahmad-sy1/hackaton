"use server";

import { redirect } from "next/navigation";
import { createRide, getEstimate } from "./queries";
import type { RequestEstimateState } from "./ride-estimate.types";

/**
 * Start screen form (useActionState). Checks the choice on the server and only
 * then moves on to the estimate screen; nothing is stored here (AC-01.4).
 */
export async function requestEstimate(
  _previousState: RequestEstimateState,
  formData: FormData,
): Promise<RequestEstimateState> {
  const originId = formData.get("origin");
  const destinationId = formData.get("destination");
  const result = await getEstimate(originId, destinationId);

  if (result.status !== "ok") {
    return {
      message: result.message,
      originId: typeof originId === "string" ? originId : "",
      destinationId: typeof destinationId === "string" ? destinationId : "",
    };
  }

  redirect(
    estimateUrl(result.estimate.originId, result.estimate.destinationId),
  );
}

/**
 * Accepting stores the ride. The estimate is calculated again here, so the
 * stored price never comes from the browser (AC-01.4).
 */
export async function acceptEstimate(
  originId: string,
  destinationId: string,
): Promise<void> {
  const result = await getEstimate(originId, destinationId);
  // The estimate screen shows why there is no estimate.
  if (result.status !== "ok") redirect(estimateUrl(originId, destinationId));

  const rideId = await createRide(result.estimate);
  redirect(`/rit/${rideId}`);
}

function estimateUrl(
  originId: number | string,
  destinationId: number | string,
) {
  const params = new URLSearchParams({
    van: String(originId),
    naar: String(destinationId),
  });
  return `/schatting?${params.toString()}`;
}
