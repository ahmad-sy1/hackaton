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

/** Hulpfunctie: n dagen na de laatste maandag, op een gegeven uur. */
function dezeWeek(dagOffset: number, uur = 10): Date {
  const d = laatsteMaandag();
  d.setDate(d.getDate() + dagOffset);
  d.setHours(uur, 0, 0, 0);
  return d;
}

/** Hulpfunctie: n dagen geleden. */
function dagenGeleden(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function alsDatum(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  // Schoon beginnen. Volgorde omgekeerd aan de FK's.
  await db.execute(
    sql`TRUNCATE TABLE ${visitLogs}, ${users}, ${subscriptions} RESTART IDENTITY CASCADE`,
  );

  const [basis, plus, premium] = await db
    .insert(subscriptions)
    .values([
      { subscriptionName: "Basis", subscriptionLimit: 1 },
      { subscriptionName: "Plus", subscriptionLimit: 2 },
      { subscriptionName: "Premium", subscriptionLimit: null }, // NULL = onbeperkt
    ])
    .returning();

  // Alle testleden gebruiken pincode 1234 — alleen voor de dev-omgeving.
  const pinHash = hashSync("1234", 10);

  // Karim zit wel in de seed maar krijgt geen visit-logs, dus geen binding nodig.
  const [sanne, mo, youssef, lisa, , nadia] = await db
    .insert(users)
    .values([
      {
        subscriptionId: basis.subscriptionId,
        firstname: "Sanne",
        lastname: "de Vries",
        email: "sanne@example.com",
        phoneNumber: "0612345601",
        pinHash,
        subscriptionStart: "2026-01-15",
        subscriptionEnd: null,
      },
      {
        subscriptionId: basis.subscriptionId,
        firstname: "Mo",
        lastname: "El Amrani",
        email: "mo@example.com",
        phoneNumber: "0612345602",
        pinHash,
        subscriptionStart: "2025-11-01",
        subscriptionEnd: null,
      },
      {
        subscriptionId: plus.subscriptionId,
        firstname: "Youssef",
        lastname: "Bakker",
        email: "youssef@example.com",
        phoneNumber: "0612345603",
        pinHash,
        subscriptionStart: "2026-03-10",
        subscriptionEnd: null,
      },
      {
        subscriptionId: premium.subscriptionId,
        firstname: "Lisa",
        lastname: "Jansen",
        email: "lisa@example.com",
        phoneNumber: "0612345604",
        pinHash,
        subscriptionStart: "2025-06-01",
        subscriptionEnd: null,
      },
      {
        subscriptionId: plus.subscriptionId,
        firstname: "Karim",
        lastname: "Yilmaz",
        email: "karim@example.com",
        phoneNumber: "0612345605",
        pinHash,
        subscriptionStart: "2025-09-01",
        // Opgezegd, maar loopt nog door tot de eerstvolgende vervaldatum.
        subscriptionEnd: alsDatum(new Date(Date.now() + 12 * 864e5)),
      },
      {
        subscriptionId: basis.subscriptionId,
        firstname: "Nadia",
        lastname: "Peters",
        email: "nadia@example.com",
        phoneNumber: "0612345606",
        pinHash,
        subscriptionStart: "2025-02-20",
        subscriptionEnd: null,
      },
    ])
    .returning();

  await db.insert(visitLogs).values([
    // Mo (Basis, limiet 1) heeft deze week al gesport -> volgende poging wordt geweigerd.
    {
      userId: mo.id,
      subscriptionTypeId: basis.subscriptionId,
      visitDate: dezeWeek(0, 9),
      accessGranted: true,
    },
    // Youssef (Plus, limiet 2) heeft er nog eentje over.
    {
      userId: youssef.id,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dezeWeek(1, 18),
      accessGranted: true,
    },
    // Lisa (Premium) sport vaak en wordt nooit geweigerd.
    {
      userId: lisa.id,
      subscriptionTypeId: premium.subscriptionId,
      visitDate: dezeWeek(0, 7),
      accessGranted: true,
    },
    {
      userId: lisa.id,
      subscriptionTypeId: premium.subscriptionId,
      visitDate: dezeWeek(1, 7),
      accessGranted: true,
    },
    {
      userId: lisa.id,
      subscriptionTypeId: premium.subscriptionId,
      visitDate: dezeWeek(2, 7),
      accessGranted: true,
    },
    // Sanne sportte vorige week — telt niet mee voor deze week.
    {
      userId: sanne.id,
      subscriptionTypeId: basis.subscriptionId,
      visitDate: dagenGeleden(9),
      accessGranted: true,
    },
    // Geweigerde poging: Mo probeerde het een tweede keer.
    {
      userId: mo.id,
      subscriptionTypeId: basis.subscriptionId,
      visitDate: dezeWeek(2, 19),
      accessGranted: false,
    },
    // Nadia: log ouder dan 14 dagen -> testcase voor de anonimiseerknop.
    {
      userId: nadia.id,
      subscriptionTypeId: basis.subscriptionId,
      visitDate: dagenGeleden(21),
      accessGranted: true,
    },
    // Al geanonimiseerde log: user_id is losgekoppeld, type blijft bewaard.
    {
      userId: null,
      subscriptionTypeId: plus.subscriptionId,
      visitDate: dagenGeleden(40),
      accessGranted: true,
    },
  ]);

  console.log("Seed klaar: 3 abonnementen, 6 leden, 9 bezoeklogs.");
  console.log("Pincode van alle testleden: 1234");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
