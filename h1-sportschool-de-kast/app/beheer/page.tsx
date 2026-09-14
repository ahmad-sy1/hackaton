"use client";

// Dit scherm hoort in productie achter een medewerkersrol (login + autorisatie).
// Dat valt buiten de scope van de gekozen kernflow (US-01/US-02) en is hier
// bewust niet gebouwd: elke bezoeker kan deze pagina nu openen.

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  oudeLogsAnonimiseren,
  statusOphalen,
} from "@/src/server/beheer/actions";
import type { AnonimiseerStatus } from "@/src/server/beheer/anonimiseren.types";

// Welk scherm de medewerker ziet.
type Scherm =
  | { naam: "laden" }
  | { naam: "overzicht"; status: AnonimiseerStatus }
  | { naam: "bevestigen"; status: AnonimiseerStatus }
  | { naam: "klaar"; aantal: number };

export default function BeheerPagina() {
  const [scherm, setScherm] = useState<Scherm>({ naam: "laden" });
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, start] = useTransition();

  // Haalt de status op; geen synchrone state-reset vooraf, zodat dit ook
  // rechtstreeks vanuit het mount-effect aangeroepen kan worden.
  function statusOphalenEnTonen() {
    start(async () => {
      try {
        const status = await statusOphalen();
        setScherm({ naam: "overzicht", status });
      } catch {
        setFout("Er ging iets mis bij het ophalen van de status.");
        setScherm({ naam: "overzicht", status: { aantal: 0, grens: "" } });
      }
    });
  }

  // Voor de "terug naar overzicht"-knop: toont eerst het laadscherm.
  function statusLaden() {
    setFout(null);
    setScherm({ naam: "laden" });
    statusOphalenEnTonen();
  }

  useEffect(() => {
    statusOphalenEnTonen();
  }, []);

  function anonimiserenBevestigen() {
    setFout(null);
    start(async () => {
      try {
        const res = await oudeLogsAnonimiseren();
        if (res.status === "gedaan") {
          setScherm({ naam: "klaar", aantal: res.aantal });
        } else {
          setScherm({ naam: "klaar", aantal: 0 });
        }
      } catch {
        setFout("Er ging iets mis. Probeer het opnieuw.");
        statusLaden();
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
          <nav className="flex gap-2">
            <Link
              href="/check-in"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Inchecken
            </Link>
            <Link
              href="/abonnement"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Mijn abonnement
            </Link>
          </nav>
        </header>

        <div className="p-8 sm:p-10">
          {scherm.naam === "laden" && (
            <p className="text-lg text-zinc-600">Bezig met laden…</p>
          )}

          {scherm.naam === "overzicht" && (
            <Overzicht
              status={scherm.status}
              fout={fout}
              onAnonimiseren={() =>
                setScherm({ naam: "bevestigen", status: scherm.status })
              }
            />
          )}

          {scherm.naam === "bevestigen" && (
            <Bevestigen
              status={scherm.status}
              bezig={bezig}
              onBevestig={anonimiserenBevestigen}
              onAnnuleren={() =>
                setScherm({ naam: "overzicht", status: scherm.status })
              }
            />
          )}

          {scherm.naam === "klaar" && (
            <Klaar aantal={scherm.aantal} onTerug={statusLaden} />
          )}
        </div>
      </div>
    </main>
  );
}

function Overzicht({
  status,
  fout,
  onAnonimiseren,
}: {
  status: AnonimiseerStatus;
  fout: string | null;
  onAnonimiseren: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Bezoeklogs anonimiseren
      </h1>

      {status.aantal > 0 ? (
        <p className="mt-4 text-lg text-zinc-700">
          <span className="font-semibold">{status.aantal}</span> bezoeklogs van
          vóór {formatteerDatum(status.grens)} bevatten nog een lidnummer.
        </p>
      ) : (
        <p className="mt-4 text-lg text-zinc-600">
          Er zijn geen bezoeklogs van vóór {formatteerDatum(status.grens)} met
          nog een lidnummer.
        </p>
      )}

      {fout && (
        <p role="alert" className="mt-4 text-lg font-medium text-red-700">
          {fout}
        </p>
      )}

      {status.aantal > 0 && (
        <button
          type="button"
          onClick={onAnonimiseren}
          className="mt-8 w-full rounded-xl bg-zinc-900 py-5 text-xl font-semibold text-white"
        >
          Anonimiseren
        </button>
      )}
    </div>
  );
}

function Bevestigen({
  status,
  bezig,
  onBevestig,
  onAnnuleren,
}: {
  status: AnonimiseerStatus;
  bezig: boolean;
  onBevestig: () => void;
  onAnnuleren: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Bezoeklogs anonimiseren?
      </h1>
      <div className="mt-6 rounded-2xl bg-red-50 p-6 text-red-900">
        <p className="text-lg">
          Het lidnummer wordt verwijderd bij{" "}
          <span className="font-semibold">{status.aantal}</span> bezoeklogs van
          vóór {formatteerDatum(status.grens)}. Dit is niet terug te draaien.
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
        {bezig ? "Bezig met anonimiseren…" : "Ja, anonimiseren"}
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

function Klaar({ aantal, onTerug }: { aantal: number; onTerug: () => void }) {
  return (
    <div className="text-center">
      <div
        aria-hidden
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-5xl text-white"
      >
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-bold text-zinc-900">
        {aantal > 0
          ? `${aantal} bezoeklogs geanonimiseerd`
          : "Niets te anonimiseren"}
      </h1>

      <button
        type="button"
        onClick={onTerug}
        className="mt-8 w-full rounded-xl border-2 border-zinc-300 py-4 text-lg font-semibold text-zinc-800 hover:bg-zinc-50"
      >
        Terug naar overzicht
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
