"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { checkIn } from "@/src/server/inchecken/actions";
import type { IncheckResultaat } from "@/src/server/inchecken/toegang.types";
import { Resultaat } from "./_components/Resultaat";

// Kiosk: na een geslaagde check-in automatisch terug naar het invoerscherm.
const AUTO_TERUG_MS = 5000;

// Wat het resultaatscherm toont: de uitkomst van de action, of dat de action
// zelf niet bereikbaar was. null = invoerscherm.
type Uitkomst = IncheckResultaat | { status: "verbindingsfout" };

export default function CheckInPagina() {
  const [lidnummer, setLidnummer] = useState("");
  const [pincode, setPincode] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [uitkomst, setUitkomst] = useState<Uitkomst | null>(null);
  const [bezig, startIncheck] = useTransition();

  const terugNaarStart = useCallback(() => {
    setUitkomst(null);
    setLidnummer("");
    setPincode("");
  }, []);

  useEffect(() => {
    if (uitkomst?.status !== "granted") return;
    const id = setTimeout(terugNaarStart, AUTO_TERUG_MS);
    return () => clearTimeout(id);
  }, [uitkomst, terugNaarStart]);

  function verstuur(e: FormEvent) {
    e.preventDefault();
    // Client-validatie is alleen voor bruikbaarheid; de echte controle
    // (bestaat het lid, klopt de pincode, limiet) zit in de server action.
    if (lidnummer === "") {
      setFout("Vul je lidnummer in.");
      return;
    }
    if (!/^\d{4}$/.test(pincode)) {
      setFout("Vul je pincode van 4 cijfers in.");
      return;
    }
    setFout(null);
    startIncheck(async () => {
      try {
        setUitkomst(await checkIn(lidnummer, pincode));
      } catch {
        setUitkomst({ status: "verbindingsfout" });
      }
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-5">
          <span className="text-2xl font-bold tracking-tight text-zinc-900">
            De Kast
          </span>
          <span className="text-sm text-zinc-500">Kiosk · Ingang</span>
        </header>

        <div className="p-8 sm:p-12">
          {uitkomst !== null ? (
            <div aria-live="polite">
              {uitkomst.status === "verbindingsfout" ? (
                <VerbindingsfoutPaneel />
              ) : (
                <Resultaat resultaat={uitkomst} autoTerugMs={AUTO_TERUG_MS} />
              )}
              <button
                type="button"
                onClick={terugNaarStart}
                className="mt-8 w-full rounded-xl border-2 border-zinc-300 py-5 text-xl font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Terug naar start
              </button>
            </div>
          ) : (
            <form onSubmit={verstuur} className="mx-auto max-w-xl" noValidate>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
                Welkom bij De Kast
              </h1>
              <p className="mt-2 text-lg text-zinc-600">
                Voer je lidnummer en pincode in.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="lidnummer"
                    className="block text-sm font-semibold tracking-wide text-zinc-700"
                  >
                    LIDNUMMER
                  </label>
                  {/* Kiosk zonder muis: het formulier wordt opnieuw gemount bij
                      "terug naar start", dus autoFocus werkt elke keer. */}
                  <input
                    id="lidnummer"
                    autoFocus
                    value={lidnummer}
                    onChange={(e) =>
                      setLidnummer(e.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="bv. 42"
                    className="mt-2 w-full rounded-xl border-2 border-zinc-300 px-5 py-4 text-2xl text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-semibold tracking-wide text-zinc-700"
                  >
                    PINCODE
                  </label>
                  <input
                    id="pincode"
                    type="password"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    placeholder="4 cijfers"
                    className="mt-2 w-full rounded-xl border-2 border-zinc-300 px-5 py-4 text-2xl tracking-[0.5em] text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {fout && (
                <p
                  role="alert"
                  className="mt-4 text-lg font-medium text-red-700"
                >
                  {fout}
                </p>
              )}

              <button
                type="submit"
                disabled={bezig}
                className="mt-8 w-full rounded-xl bg-zinc-900 py-5 text-xl font-semibold text-white disabled:opacity-60"
              >
                {bezig ? "Bezig met inchecken…" : "Check in"}
              </button>

              <p className="mt-6 text-center text-zinc-500">
                Hulp nodig? Bel de receptie.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function VerbindingsfoutPaneel() {
  return (
    <div className="text-center">
      <div
        aria-hidden
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 text-5xl"
      >
        !
      </div>
      <h2 className="mt-6 text-3xl font-bold text-zinc-900">
        Even niet gelukt
      </h2>
      <p className="mt-2 text-lg text-zinc-600">
        Er ging iets mis bij het inchecken. Probeer het opnieuw of spreek een
        medewerker aan.
      </p>
    </div>
  );
}
