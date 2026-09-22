import { hashSync } from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { subscriptions, users, visitLogs } from "./schema";

/** Maandag 00:00 van de huidige week — het startpunt van de weektelling. */
function laatsteMaandag(): Date {
  const nu = new Date();
  const dagen = (nu.getDay() + 6) % 7; // zondag = 0 -> 6 dagen terug
  const maandag = new Date(nu);
  maandag.setDate(nu.getDate() - dagen);
  maandag.setHours(0, 0, 0, 0);
  return maandag;
}

/**
 * Een moment tussen maandag 00:00 en nu, op basis van `fractie` (0 = maandag
 * 00:00, 1 = nu). Ligt altijd binnen die grenzen — ook als de seed vlak na
 * maandag 00:00 draait — dus nooit in de toekomst.
 */
function dezeWeekFractie(fractie: number): Date {
  const maandag = laatsteMaandag().getTime();
  const nu = Date.now();
  return new Date(maandag + (nu - maandag) * fractie);
}

/** `n` dagen vóór afgelopen maandag 00:00 — altijd buiten de huidige week. */
function voorMaandag(n: number): Date {
  const d = laatsteMaandag();
  d.setDate(d.getDate() - n);
  return d;
}

/** `n` dagen geleden (positief) of vooruit (negatief), zelfde tijdstip als nu. */
function dagenGeleden(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** `dag` in (`jaar`, `maandIndex`), geklemd naar de laatste dag van die maand. */
function klemDag(jaar: number, maandIndex: number, dag: number): Date {
  const laatsteDag = new Date(jaar, maandIndex + 1, 0).getDate();
  return new Date(jaar, maandIndex, Math.min(dag, laatsteDag));
}

/**
 * `n` maanden geleden, op dag-van-de-maand `dag` (standaard: dezelfde dag als
 * vandaag). Geklemd naar de laatste dag van de doelmaand als die dag daar niet
 * bestaat (bv. de 31e in februari).
 */
function maandenGeleden(n: number, dag?: number): Date {
  const nu = new Date();
  return klemDag(nu.getFullYear(), nu.getMonth() - n, dag ?? nu.getDate());
}

// Lokale datum, geen toISOString(): die rekent om naar UTC en zou de datum
// een dag kunnen laten omslaan (bv. bij middernacht in een zomertijdzone).
function alsDatum(d: Date): string {
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

export async function seedDatabase(): Promise<void> {
  // Schoon beginnen. Volgorde omgekeerd aan de FK's.
  await db.execute(
    sql`TRUNCATE TABLE ${visitLogs}, ${users}, ${subscriptions} RESTART IDENTITY CASCADE`,
  );

  // "Basis" komt niet voor bij de testleden hieronder, maar hoort als
  // abonnementstype wel in de database te bestaan.
  const [, plus, premium] = await db
    .insert(subscriptions)
    .values([
      { subscriptionName: "Basis", subscriptionLimit: 1 },
      { subscriptionName: "Plus", subscriptionLimit: 2 },
      { subscriptionName: "Premium", subscriptionLimit: null }, // NULL = onbeperkt
    ])
    .returning();

  // Alle testleden gebruiken pincode 1234 — alleen voor de dev-/testomgeving.
  const pinHash = hashSync("1234", 10);

  // Volgorde bepaalt het lidnummer (identity-kolom begint bij 1): M1 = id 1, ... M8 = id 8.
  // Alleen M1 t/m M5 krijgen bezoeklogs; M6 t/m M8 zijn puur voor de
  // abonnementscasussen en hoeven hier niet apart benoemd te worden.
  const [m1, m2, m3, m4, m5] = await db
    .insert(users)
    .values([
      {
        // M1: 0 bezoeken deze week, niet opgezegd. Start op de 5e van een
        // eerdere maand — nodig om de opzegtermijn (TC-08/TC-09) te toetsen.
        subscriptionId: plus.subscriptionId,
        firstname: "Anna",
        lastname: "Bakker",
        email: "m1@example.com",
        phoneNumber: "0610000001",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(6, 5)),
        subscriptionEnd: null,
      },
      {
        // M2: 2 geslaagde bezoeken deze week -> limiet (2) bereikt.
        subscriptionId: plus.subscriptionId,
        firstname: "Bram",
        lastname: "de Wit",
        email: "m2@example.com",
        phoneNumber: "0610000002",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(4)),
        subscriptionEnd: null,
      },
      {
        // M3: 1 geslaagd bezoek deze week -> nog ruimte over.
        subscriptionId: plus.subscriptionId,
        firstname: "Chris",
        lastname: "Mulder",
        email: "m3@example.com",
        phoneNumber: "0610000003",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(7)),
        subscriptionEnd: null,
      },
      {
        // M4: Premium (onbeperkt), 3 geslaagde bezoeken deze week.
        subscriptionId: premium.subscriptionId,
        firstname: "Daan",
        lastname: "Visser",
        email: "m4@example.com",
        phoneNumber: "0610000004",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(10)),
        subscriptionEnd: null,
      },
      {
        // M5: 2 geslaagde bezoeken vóór afgelopen maandag, 0 deze week.
        subscriptionId: plus.subscriptionId,
        firstname: "Eva",
        lastname: "Smit",
        email: "m5@example.com",
        phoneNumber: "0610000005",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(9)),
        subscriptionEnd: null,
      },
      {
        // M6: opgezegd, einddatum ligt nog in de toekomst -> toegang blijft werken.
        subscriptionId: plus.subscriptionId,
        firstname: "Fenna",
        lastname: "Groen",
        email: "m6@example.com",
        phoneNumber: "0610000006",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(11)),
        subscriptionEnd: alsDatum(dagenGeleden(-12)),
      },
      {
        // M7: opgezegd, einddatum was gisteren -> abonnement verlopen.
        subscriptionId: plus.subscriptionId,
        firstname: "Guus",
        lastname: "Willems",
        email: "m7@example.com",
        phoneNumber: "0610000007",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(13)),
        subscriptionEnd: alsDatum(dagenGeleden(1)),
      },
      {
        // M8: start op dezelfde dag-van-de-maand als vandaag, een eerdere
        // maand (geklemd) -> nodig om de opzegtermijn (TC-10) te toetsen.
        subscriptionId: plus.subscriptionId,
        firstname: "Hana",
        lastname: "Jacobs",
        email: "m8@example.com",
        phoneNumber: "0610000008",
        pinHash,
        subscriptionStart: alsDatum(maandenGeleden(2)),
        subscriptionEnd: null,
      },
    ])
    .returning();

  await db.insert(visitLogs).values([
    // M2 (Plus, limiet 2): allebei de bezoeken van deze week geslaagd.
    {
      userId: m2.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dezeWeekFractie(0.3),
      accessGranted: true,
    },
    {
      userId: m2.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dezeWeekFractie(0.6),
      accessGranted: true,
    },
    // M3 (Plus, limiet 2): één bezoek deze week.
    {
      userId: m3.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dezeWeekFractie(0.5),
      accessGranted: true,
    },
    // M4 (Premium): drie bezoeken deze week; de laatste is exact "vandaag".
    {
      userId: m4.id,
      subscriptionTypeId: premium.subscriptionId,
      visitDate: dezeWeekFractie(0.2),
      accessGranted: true,
    },
    {
      userId: m4.id,
      subscriptionTypeId: premium.subscriptionId,
      visitDate: dezeWeekFractie(0.6),
      accessGranted: true,
    },
    {
      userId: m4.id,
      subscriptionTypeId: premium.subscriptionId,
      visitDate: dezeWeekFractie(1),
      accessGranted: true,
    },
    // M5 (Plus, limiet 2): beide bezoeken vóór afgelopen maandag -> tellen niet mee.
    {
      userId: m5.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: voorMaandag(3),
      accessGranted: true,
    },
    {
      userId: m5.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: voorMaandag(7),
      accessGranted: true,
    },
    // M1: log van 21 dagen oud mét lidnummer -> testcase voor de anonimiseerknop (TC-14).
    {
      userId: m1.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dagenGeleden(21),
      accessGranted: true,
    },
    // Al geanonimiseerde log: user_id is losgekoppeld, abonnementstype blijft bewaard.
    {
      userId: null,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dagenGeleden(40),
      accessGranted: true,
    },
  ]);

  console.log("Seed klaar: 3 abonnementen, 8 leden, 10 bezoeklogs.");
  console.log("Pincode van alle testleden: 1234");
}

// Alleen uitvoeren (en het proces afsluiten) als dit bestand direct wordt
// aangeroepen — niet wanneer cy.task("seed") de functie importeert.
const directAangeroepen =
  process.argv[1] !== undefined &&
  import.meta.url === `file://${process.argv[1]}`;

if (directAangeroepen) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
