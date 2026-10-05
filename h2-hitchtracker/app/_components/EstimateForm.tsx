"use client";

import { startTransition, useActionState, useState } from "react";
import type { FormEvent } from "react";
import { requestEstimate } from "@/src/server/ride-estimate/actions";
import { MISSING_INPUT_MESSAGE } from "@/src/server/ride-estimate/ride-estimate";
import type {
  LocationWithCity,
  RequestEstimateState,
} from "@/src/server/ride-estimate/ride-estimate.types";

const initialState: RequestEstimateState = {
  error: null,
  originId: "",
  destinationId: "",
};

// Which message the screen shows: none, the AC-01.1 message (wireframe 1a)
// or the AC-01.5 message (wireframe 1b).
type Notice = "none" | "missing_input" | "no_estimate";

export function EstimateForm({
  pickupPoints,
}: {
  pickupPoints: LocationWithCity[];
}) {
  const [state, formAction, pending] = useActionState(
    requestEstimate,
    initialState,
  );
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [clientMissingInput, setClientMissingInput] = useState(false);

  // A server message only belongs to the selection it was given for.
  const serverError =
    state.error !== null &&
    state.originId === originId &&
    state.destinationId === destinationId
      ? state.error
      : null;
  const notice: Notice = clientMissingInput
    ? "missing_input"
    : (serverError?.status ?? "none");

  function submit(e: FormEvent<HTMLFormElement>) {
    // Calling the action by hand skips React's automatic form reset, so the
    // chosen points stay visible next to the message (wireframe 1b).
    e.preventDefault();
    // Browser check for usability only; the server action checks again.
    if (originId === "" || destinationId === "" || originId === destinationId) {
      setClientMissingInput(true);
      return;
    }
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  function changeOrigin(id: string) {
    setOriginId(id);
    setClientMissingInput(false);
    // The destination list leaves out the origin, so drop a choice that clashes.
    if (id === destinationId) setDestinationId("");
  }

  function changeDestination(id: string) {
    setDestinationId(id);
    setClientMissingInput(false);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8">
      <div className="grid grid-cols-2 gap-4">
        <PickupSelect
          id="origin"
          label="Vertrekpunt"
          placeholder="Kies een ophaalpunt"
          pickupPoints={pickupPoints}
          value={originId}
          onChange={changeOrigin}
          invalid={notice === "missing_input" && originId === ""}
        />
        <PickupSelect
          id="destination"
          label="Bestemming"
          placeholder="Kies een bestemming"
          pickupPoints={pickupPoints.filter((p) => String(p.id) !== originId)}
          value={destinationId}
          onChange={changeDestination}
          invalid={notice === "missing_input" && destinationId === ""}
        />
      </div>

      {notice === "missing_input" && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          ⚠ {MISSING_INPUT_MESSAGE}
        </p>
      )}
      {notice === "no_estimate" && serverError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900"
        >
          ⚠ {serverError.message}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-zinc-600">Kies uit de vaste ophaalpunten.</p>
        <button
          type="submit"
          disabled={pending || notice === "no_estimate"}
          className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-zinc-300 disabled:text-zinc-600"
        >
          {pending ? "Bezig…" : "Schatting opvragen"}
        </button>
      </div>
    </form>
  );
}

function PickupSelect({
  id,
  label,
  placeholder,
  pickupPoints,
  value,
  onChange,
  invalid,
}: {
  id: string;
  label: string;
  placeholder: string;
  pickupPoints: LocationWithCity[];
  value: string;
  onChange: (id: string) => void;
  invalid: boolean;
}) {
  const cityNames = [...new Set(pickupPoints.map((p) => p.cityName))];

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className="mt-2 w-full rounded-lg border-2 border-zinc-300 bg-white px-4 py-3 outline-none focus:border-zinc-900 aria-invalid:border-red-600"
      >
        <option value="">{placeholder}</option>
        {cityNames.map((cityName) => (
          <optgroup key={cityName} label={cityName}>
            {pickupPoints
              .filter((p) => p.cityName === cityName)
              .map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
