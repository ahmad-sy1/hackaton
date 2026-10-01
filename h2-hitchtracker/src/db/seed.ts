import { db } from "./index";
import { cities, locations, routes, tariffs } from "./schema";

type RoutePair = [
  from: string,
  to: string,
  distanceM: number,
  durationS: number,
];

// One row per pair; the seed inserts both directions with the same values.
const amsterdamRoutes: RoutePair[] = [
  ["Centraal Station", "Schiphol", 17000, 1500],
  ["Centraal Station", "Museumplein", 3500, 840],
  ["Centraal Station", "Vondelpark", 3800, 900],
  ["Centraal Station", "Amsterdam Zuid", 6500, 1080],
  ["Schiphol", "Museumplein", 14000, 1260],
  ["Schiphol", "Vondelpark", 13500, 1260],
  ["Schiphol", "Amsterdam Zuid", 10500, 960],
  ["Museumplein", "Vondelpark", 1200, 420],
  ["Museumplein", "Amsterdam Zuid", 3200, 600],
  ["Vondelpark", "Amsterdam Zuid", 4000, 660],
];

const rotterdamRoutes: RoutePair[] = [
  ["Rotterdam Centraal", "Erasmusbrug", 2200, 480],
];

async function seedDatabase() {
  const [amsterdam, rotterdam] = await db
    .insert(cities)
    .values([{ name: "Amsterdam" }, { name: "Rotterdam" }])
    .returning();

  await db.insert(tariffs).values({
    cityId: amsterdam.id,
    startFeeCents: 300,
    perKmCents: 240,
    perMinuteCents: 40,
    isActive: true,
  });
  // Rotterdam deliberately has no tariff: it covers AC-01.5.

  const insertedLocations = await db
    .insert(locations)
    .values([
      { cityId: amsterdam.id, name: "Centraal Station" },
      { cityId: amsterdam.id, name: "Schiphol" },
      { cityId: amsterdam.id, name: "Museumplein" },
      { cityId: amsterdam.id, name: "Vondelpark" },
      { cityId: amsterdam.id, name: "Amsterdam Zuid" },
      { cityId: rotterdam.id, name: "Rotterdam Centraal" },
      { cityId: rotterdam.id, name: "Erasmusbrug" },
    ])
    .returning();

  const idByName = new Map(insertedLocations.map((l) => [l.name, l.id]));
  const locationId = (name: string) => {
    const id = idByName.get(name);
    if (id === undefined) throw new Error(`Onbekend ophaalpunt: ${name}`);
    return id;
  };

  const routeRows = [...amsterdamRoutes, ...rotterdamRoutes].flatMap(
    ([from, to, distanceM, durationS]) => [
      {
        originLocationId: locationId(from),
        destinationLocationId: locationId(to),
        distanceM,
        durationS,
      },
      {
        originLocationId: locationId(to),
        destinationLocationId: locationId(from),
        distanceM,
        durationS,
      },
    ],
  );
  await db.insert(routes).values(routeRows);

  console.log(
    `Seed klaar: 2 steden, 1 tarief, ${insertedLocations.length} ophaalpunten, ${routeRows.length} routes.`,
  );
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
