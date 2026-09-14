"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import {
  abonnementOpzeggen,
  overzichtOphalen,
} from "@/src/server/abonnement/actions";
import type { AbonnementOverzicht } from "@/src/server/abonnement/abonnement.types";

// Welk scherm het lid ziet. De inloggegevens blijven in state staan zolang het
// lid bezig is: de server action verifieert ze bij elke stap opnieuw, dus dit is
// gemak, geen beveiliging.
type Scherm =
  | { naam: "inloggen" }
  | { naam: "overzicht"; overzicht: AbonnementOverzicht }
  | { naam: "bevestigen"; overzicht: AbonnementOverzicht }
  | { naam: "opgezegd"; einddatum: string };

export default function AbonnementPagina() {
  const [lidnummer, setLidnummer] = useState("");
  const [pincode, setPincode] = useState("");
  const [scherm, setScherm] = useState<Scherm>({ naam: "inloggen" });
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, start] = useTransition();

  function opnieuwBeginnen() {
    setLidnummer("");
    setPincode("");
    setFout(null);
    setScherm({ naam: "inloggen" });
  }

  function inloggen(e: FormEvent) {
    e.preventDefault();
    // Client-validatie is alleen voor bruikbaarheid; de echte controle zit in
    // de server action.
    if (lidnummer === "") {
      setFout("Vul je lidnummer in.");
      return;
    }
    if (!/^\d{4}$/.test(pincode)) {
      setFout("Vul je pincode van 4 cijfers in.");
      return;
    }
    setFout(null);
    start(async () => {
      try {
        const res = await overzichtOphalen(lidnummer, pincode);
        if (res.status === "gevonden") {
          setScherm({ naam: "overzicht", overzicht: res.overzicht });
        } else {
          setFout(res.melding);
        }
      } catch {
        setFout("Er ging iets mis. Probeer het opnieuw.");
      }
    });
  }

  function opzeggenBevestigen(overzicht: AbonnementOverzicht) {
    setFout(null);
    start(async () => {
      try {
        const res = await abonnementOpzeggen(lidnummer, pincode);
        if (res.status === "opgezegd") {
          setScherm({ naam: "opgezegd", einddatum: res.einddatum });
        } else {
          setFout(res.melding);
          setScherm({ naam: "overzicht", overzicht });
        }
      } catch {
        setFout("Er ging iets mis. Probeer het opnieuw.");
        setScherm({ naam: "overzicht", overzicht });
      }
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-5">
          <span className="text-2xl font-bold tracking-tight text-zinc-900">
            De Kast
          </span>
          <Link
            href="/check-in"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Inchecken
          </Link>
        </header>

        <div className="p-8 sm:p-10">
          {scherm.naam === "inloggen" && (
            <form onSubmit={inloggen} noValidate>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Mijn abonnement
              </h1>
              <p className="mt-2 text-zinc-600">
                Log in met je lidnummer en pincode om je abonnement te bekijken
                of op te zeggen.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="lidnummer"
                    className="block text-sm font-semibold tracking-wide text-zinc-700"
                  >
                    LIDNUMMER
                  </label>
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
                {bezig ? "Bezig met inloggen…" : "Inloggen"}
              </button>
            </form>
          )}

          {scherm.naam === "overzicht" && (
            <Overzicht
              overzicht={scherm.overzicht}
              fout={fout}
              onOpzeggen={() =>
                setScherm({ naam: "bevestigen", overzicht: scherm.overzicht })
              }
              onUitloggen={opnieuwBeginnen}
            />
          )}

          {scherm.naam === "bevestigen" && (
            <Bevestigen
              overzicht={scherm.overzicht}
              bezig={bezig}
              onBevestig={() => opzeggenBevestigen(scherm.overzicht)}
              onAnnuleren={() =>
                setScherm({ naam: "overzicht", overzicht: scherm.overzicht })
              }
            />
          )}

          {scherm.naam === "opgezegd" && (
            <Opgezegd einddatum={scherm.einddatum} onKlaar={opnieuwBeginnen} />
          )}
        </div>
      </div>
    </main>
  );
}

function Overzicht({
  overzicht,
  fout,
  onOpzeggen,
  onUitloggen,
}: {
  overzicht: AbonnementOverzicht;
  fout: string | null;
  onOpzeggen: () => void;
  onUitloggen: () => void;
}) {
  const { voornaam, achternaam, abonnementsnaam, startdatum, einddatum } =
    overzicht;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Hallo {voornaam}
      </h1>
      <p className="mt-1 text-zinc-600">{`${voornaam} ${achternaam}`}</p>

      <dl className="mt-8 rounded-2xl border border-zinc-200 p-6 text-lg">
        <div className="flex justify-between gap-4 border-b border-zinc-100 py-3">
          <dt className="text-zinc-500">Abonnement</dt>
          <dd className="font-semibold text-zinc-900">{abonnementsnaam}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-zinc-100 py-3">
          <dt className="text-zinc-500">Lid sinds</dt>
          <dd className="font-semibold text-zinc-900">
            {formatteerDatum(startdatum)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-zinc-500">Status</dt>
          <dd className="font-semibold text-zinc-900">
            {einddatum === null
              ? "Actief"
              : `Opgezegd — toegang t/m ${formatteerDatum(einddatum)}`}
          </dd>
        </div>
      </dl>

      {fout && (
        <p role="alert" className="mt-4 text-lg font-medium text-red-700">
          {fout}
        </p>
      )}

      {einddatum === null ? (
        <button
          type="button"
          onClick={onOpzeggen}
          className="mt-8 w-full rounded-xl border-2 border-red-300 py-5 text-xl font-semibold text-red-700 hover:bg-red-50"
        >
          Abonnement opzeggen
        </button>
      ) : (
        <p className="mt-8 rounded-xl bg-zinc-100 py-4 text-center text-zinc-600">
          Je abonnement is al opgezegd. Neem contact op met de balie om dit
          terug te draaien.
        </p>
      )}

      <button
        type="button"
        onClick={onUitloggen}
        className="mt-4 w-full rounded-xl border-2 border-zinc-300 py-4 text-lg font-semibold text-zinc-800 hover:bg-zinc-50"
      >
        Uitloggen
      </button>
    </div>
  );
}

function Bevestigen({
  overzicht,
  bezig,
  onBevestig,
  onAnnuleren,
}: {
  overzicht: AbonnementOverzicht;
  bezig: boolean;
  onBevestig: () => void;
  onAnnuleren: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Abonnement opzeggen?
      </h1>
      <div className="mt-6 rounded-2xl bg-red-50 p-6 text-red-900">
        <p className="text-lg">
          Je zegt je{" "}
          <span className="font-semibold">{overzicht.abonnementsnaam}</span>
          -abonnement op. Je toegang blijft werken tot het einde van de huidige
          maandcyclus; daarna vervalt de toegang automatisch.
        </p>
        <p className="mt-3 text-lg">
          Er wordt nog niets gewijzigd totdat je hieronder bevestigt.
        </p>
      </div>

      <button
        type="button"
        onClick={onBevestig}
        disabled={bezig}
        className="mt-8 w-full rounded-xl bg-red-700 py-5 text-xl font-semibold text-white disabled:opacity-60"
      >
        {bezig ? "Bezig met opzeggen…" : "Ja, opzeggen"}
      </button>
      <button
        type="button"
        onClick={onAnnuleren}
        disabled={bezig}
        className="mt-4 w-full rounded-xl border-2 border-zinc-300 py-4 text-lg font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
      >
        Nee, terug naar overzicht
      </button>
    </div>
  );
}

function Opgezegd({
  einddatum,
  onKlaar,
}: {
  einddatum: string;
  onKlaar: () => void;
}) {
  return (
    <div className="text-center">
      <div
        aria-hidden
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-5xl text-white"
      >
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-bold text-zinc-900">
        Je abonnement is opgezegd
      </h1>
      <p className="mt-3 text-lg text-zinc-600">
        Je toegang blijft geldig tot en met{" "}
        <span className="font-semibold text-zinc-900">
          {formatteerDatum(einddatum)}
        </span>
        . Daarna stopt je abonnement automatisch. Je ontvangt geen nieuwe
        facturen.
      </p>

      <button
        type="button"
        onClick={onKlaar}
        className="mt-8 w-full rounded-xl border-2 border-zinc-300 py-4 text-lg font-semibold text-zinc-800 hover:bg-zinc-50"
      >
        Klaar
      </button>
    </div>
  );
}

/** "YYYY-MM-DD" -> "14 september 2026" (lokale weergave, geen tijdzone-shift). */
function formatteerDatum(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
