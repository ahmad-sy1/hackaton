import type {
  IncheckGeweigerd,
  IncheckResultaat,
  IncheckToegestaan,
  WeigerReden,
} from "@/src/server/inchecken/toegang.types";

/** Toont de uitkomst van de server action; dekt elke variant van de union. */
export function Resultaat({
  resultaat,
  autoTerugMs,
}: {
  resultaat: IncheckResultaat;
  /** Na hoeveel ms de kiosk zelf terugspringt; alleen relevant bij toegang. */
  autoTerugMs: number;
}) {
  if (resultaat.status === "granted") {
    return <ToegangVerleend resultaat={resultaat} autoTerugMs={autoTerugMs} />;
  }
  return <ToegangGeweigerd resultaat={resultaat} />;
}

function ToegangVerleend({
  resultaat,
  autoTerugMs,
}: {
  resultaat: IncheckToegestaan;
  autoTerugMs: number;
}) {
  const { naam, bezoekenDezeWeek, limiet } = resultaat;
  const voornaam = naam.split(" ")[0];

  // "resterend" is puur weergave, afgeleid van wat de action teruggeeft — geen
  // eigen limietcontrole (die hoort in de backend).
  const typeTekst = limiet === null ? "Onbeperkt" : `${limiet}× per week`;
  const bezoekTekst =
    limiet === null
      ? "onbeperkt"
      : `nog ${Math.max(limiet - bezoekenDezeWeek, 0)} van ${limiet} bezoeken`;

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="rounded-2xl bg-emerald-50 p-10 text-center">
        <div
          aria-hidden
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-5xl text-white"
        >
          ✓
        </div>
        <h2 className="mt-6 text-3xl font-bold text-emerald-900">
          Welkom, {voornaam}!
        </h2>
        <p className="mt-2 text-lg text-emerald-800">
          Toegang verleend. Veel plezier met trainen.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-8 text-lg">
        <dl>
          <div className="flex justify-between gap-4 border-b border-zinc-100 py-3">
            <dt className="text-zinc-500">Type</dt>
            <dd className="font-semibold text-zinc-900">{typeTekst}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-zinc-500">Bezoeken deze week</dt>
            <dd className="font-semibold text-zinc-900">{bezoekTekst}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-lg bg-zinc-100 py-3 text-center text-base text-zinc-600">
          Poortje opent · terug naar start na {autoTerugMs / 1000} s
        </p>
      </div>
    </div>
  );
}

function ToegangGeweigerd({ resultaat }: { resultaat: IncheckGeweigerd }) {
  const { kop, hulp } = WEIGER_WEERGAVE[resultaat.reden];

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="rounded-2xl bg-red-50 p-10 text-center">
        <div
          aria-hidden
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-5xl text-white"
        >
          ✕
        </div>
        <h2 className="mt-6 text-3xl font-bold text-red-900">Geen toegang</h2>
        <p className="mt-4 text-sm font-semibold tracking-wide text-red-700">
          REDEN
        </p>
        <p className="text-xl font-medium text-red-900">{kop}</p>
        <p className="mt-3 text-base text-red-800">{resultaat.melding}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-8">
        <p className="text-sm font-semibold tracking-wide text-zinc-500">
          WAT KUN JE NU DOEN?
        </p>
        <ul className="mt-4 space-y-2 text-lg text-zinc-800">
          {hulp.map((regel) => (
            <li key={regel} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{regel}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Korte kop + concrete vervolgstappen per weigerreden. Het Record-type dwingt
// af dat elke reden uit de backend hier een weergave heeft.
const WEIGER_WEERGAVE: Record<WeigerReden, { kop: string; hulp: string[] }> = {
  limiet_bereikt: {
    kop: "Weeklimiet bereikt",
    hulp: [
      "Kom volgende week terug",
      'Upgrade naar Onbeperkt via "Mijn abonnement"',
      "Vragen? Spreek een medewerker aan",
    ],
  },
  abonnement_verlopen: {
    kop: "Abonnement verlopen",
    hulp: [
      "Verleng je abonnement bij de receptie",
      "Vragen? Spreek een medewerker aan",
    ],
  },
  ongeldige_inloggegevens: {
    kop: "Onjuiste inloggegevens",
    hulp: [
      "Controleer je lidnummer en pincode",
      "Pincode vergeten? Vraag het bij de receptie",
    ],
  },
};
