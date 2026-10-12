# HitchTracker

HitchTracker helpt toeristen die een taxi nemen om niet te veel te betalen. Vóór de rit ziet de
reiziger een schatting van de prijs en de reistijd, berekend met het tarief van de stad. Na de rit
ziet de reiziger de eindprijs naast die schatting, met het verschil en een waarschuwing als de rit
veel duurder is geworden.

Deze hackathon bouwt Epic 1 (ritschatting vooraf, US-01) en Epic 3 (eindprijs controleren, US-02).
Epic 2 (live route en prijs tijdens de rit) valt buiten scope; zie "Haalbaarheid: afbakening" in
het [ontwerpdocument](docs/ontwerp/ontwerpdocument.md). Het afronden van een rit wordt gesimuleerd
met een demoknop.

## Fasen

| Fase       | Werkproces | Status                |
| ---------- | ---------- | --------------------- |
| Ontwerpen  | B1-K1-W2   | afgerond (`h2-fase1`) |
| Realiseren | B1-K1-W3   | afgerond (`h2-fase2`) |
| Testen     | B1-K1-W4   | afgerond (`h2-fase3`) |

## Schermen

| Scherm       | Route                         | Wat het doet                                                                                                                                                                      |
| ------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startscherm  | `/`                           | "Waar wil je naartoe?" De reiziger kiest een vertrekpunt en een bestemming uit de vaste ophaalpunten en vraagt een schatting op.                                                  |
| Schatting    | `/estimate?from=<id>&to=<id>` | Verwachte prijs, reistijd en afstand, met het gebruikte tarief. Met "Schatting accepteren" wordt de rit vastgelegd; zonder accepteren wordt niets opgeslagen.                     |
| Rit is bezig | `/ride/[id]`                  | De vastgelegde schatting en de ritlink om te bewaren. Het demoblok simuleert de chauffeur die de rit afrondt (normaal of omweg).                                                  |
| Rit afgerond | `/ride/[id]`                  | Dezelfde link na het afronden: eindprijs naast de schatting, gereden afstand, ritduur en het verschil in euro's en procenten. Bij meer dan 20% hoger verschijnt een waarschuwing. |

De `id` van een rit is een uuid, zodat een ritlink niet te raden is.

## Stack

- **Next.js 16** (App Router) met **TypeScript** (strict) en **server actions**: geen aparte backend
- **PostgreSQL 17** in Docker, met **Drizzle ORM** voor schema, migraties en queries
- **Tailwind CSS** voor de opmaak
- **Playwright** voor de integratietests
- **ESLint**, **Prettier** en `tsc` voor codekwaliteit

## Projectstructuur

Drie lagen, elk met een eigen plek:

```
app/                          # FRONTEND: routing en UI (Next.js App Router)
  page.tsx                    #   startscherm (US-01)
  _components/                #   EstimateForm.tsx: formulier met vertrekpunt en bestemming
  estimate/                   #   schattingsscherm (US-01)
  ride/[id]/                  #   rit is bezig en rit afgerond (US-02)

src/
  db/                         # DATABASE
    schema/                   #   één bestand per tabel + index.ts (barrel)
      cities.ts
      tariffs.ts
      locations.ts
      routes.ts
      rides.ts
    migrations/               #   gegenereerde SQL + meta/ (snapshots per migratie)
    index.ts                  #   de Drizzle-client
    seed.ts                   #   testdata (steden, tarief, ophaalpunten, routes)
  server/                     # BACKEND: server actions en regels per feature
    ride-estimate/            #   schatting opvragen en accepteren
    ride-completion/          #   rit afronden en eindprijs berekenen
    ritten/opschonen.ts       #   ritten ouder dan 30 dagen verwijderen
  lib/                        # helpers zonder laag-binding (prijs, bedragen, eenheden)

tests/integration/            # Playwright-tests (TC-03 t/m TC-28, type I) + support/

docs/
  ontwerp/                    # ontwerpdocument, diagrammen en wireframes
  testen/                     # testplan, testrapport en acceptatietest
  gebruikershandleiding.md    # handleiding voor de reiziger
```

## Installeren en starten

Alle commando's draai je in de map `h2-hitchtracker/`, niet in de root van de repo.

Vereist: Node.js 22 (zie `.nvmrc`), npm en Docker.

```bash
nvm use                   # Node-versie uit .nvmrc
npm ci                    # dependencies exact volgens package-lock.json
cp .env.example .env      # in h2-hitchtracker/, niet in de root van de repo
npm run db:reset          # database schoon opbouwen: container, migraties en seed
npm run dev               # start de app op http://localhost:3000
```

De standaardwaarden in `.env.example` passen bij `docker-compose.yml` (container
`hitchtracker-db`, host-poort 5433). In `.env` staan twee variabelen:

| Variabele           | Waarvoor                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL`      | De database waarmee de app (en `db:migrate`, `db:seed`, `ritten:opschonen`) werkt |
| `DATABASE_URL_TEST` | De aparte testdatabase `hitchtracker_test` voor de integratietests                |

`.env` staat in `.gitignore` en wordt nooit gecommit.

`npm run db:reset` wist de database en bouwt hem schoon opnieuw op (**alle data weg**). Stoppen
met `npm run db:down`: de data blijft bewaard in het volume `hitchtracker-db-data`. Daarna weer
starten met `npm run db:up`.

## Commando's

Draai **`npm run check`** vóór elke commit.

| Script                                    | Wat het doet                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`                             | Start de Next.js-dev-server                                                   |
| `npm run build` / `npm run start`         | Productie-build maken en draaien                                              |
| `npm run lint` / `npm run lint:fix`       | ESLint (met `--fix`: automatisch oplossen)                                    |
| `npm run format` / `npm run format:check` | Prettier schrijven / alleen controleren                                       |
| `npm run typecheck`                       | Route-types genereren en `tsc --noEmit`                                       |
| `npm run check`                           | `format:check` + `lint` + `typecheck`                                         |
| `npm run db:up` / `npm run db:down`       | Database-container starten (en wachten op de healthcheck) / stoppen           |
| `npm run db:logs`                         | Logs van de database volgen                                                   |
| `npm run db:generate`                     | Nieuwe migratie genereren na een schemawijziging                              |
| `npm run db:migrate`                      | Migraties uitvoeren                                                           |
| `npm run db:studio`                       | Drizzle Studio openen                                                         |
| `npm run db:seed`                         | Testdata inladen (`src/db/seed.ts`); leegt de tabellen niet zelf              |
| `npm run db:reset`                        | Database wissen en opnieuw opbouwen: up, migrate en seed (**wist alle data**) |
| `npm run ritten:opschonen`                | Ritten verwijderen die langer dan 30 dagen geleden zijn geaccepteerd          |
| `npm run test:integration`                | Playwright-integratietests draaien tegen de testdatabase                      |

## Database

Het schema staat in `src/db/schema/` (één bestand per tabel), de client in `src/db/index.ts`.
Bij elke schemawijziging hoort een migratie (`npm run db:generate`). Een al gecommitte migratie
pas je niet aan; je schrijft een nieuwe.

| Tabel       | Doel                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cities`    | De steden.                                                                                                                                                                            |
| `tariffs`   | Het tarief per stad: starttarief, prijs per km en prijs per minuut, in centen. Alleen een tarief met `is_active = true` wordt gebruikt voor een nieuwe schatting.                     |
| `locations` | De vaste ophaalpunten per stad. Er wordt geen GPS-locatie van de reiziger opgeslagen.                                                                                                 |
| `routes`    | Afstand (meter) en duur (seconden) tussen twee ophaalpunten.                                                                                                                          |
| `rides`     | Een geaccepteerde rit: de schatting, het gebruikte tarief, de status (`geaccepteerd` of `afgerond`) en na het afronden de werkelijke afstand, duur en eindprijs. De `id` is een uuid. |

Bedragen staan als hele centen in `integer`-kolommen, zodat er geen afrondingsfouten ontstaan.
Er zijn geen accounts en er worden geen namen of e-mailadressen opgeslagen.

**Seed.** `npm run db:seed` (ook onderdeel van `db:reset`) laadt:

- 2 steden: Amsterdam en Rotterdam;
- 1 tarief, voor Amsterdam: starttarief € 3,00, € 2,40 per km, € 0,40 per minuut. Rotterdam heeft
  bewust geen tarief, zodat de melding "geen schatting mogelijk" te zien is;
- 7 ophaalpunten: Centraal Station, Schiphol, Museumplein, Vondelpark en Amsterdam Zuid in
  Amsterdam, Rotterdam Centraal en Erasmusbrug in Rotterdam;
- 22 routes: elke combinatie binnen Amsterdam en de route in Rotterdam, steeds in beide
  richtingen;
- geen ritten.

**Opschonen.** Ritgegevens worden na 30 dagen verwijderd (privacy: dataminimalisatie, zie het
ontwerpdocument). Dat gebeurt met de hand met `npm run ritten:opschonen`. Het script meldt hoeveel
ritten het heeft verwijderd, bijvoorbeeld "1 rit(ten) ouder dan 30 dagen verwijderd."

## Testen

De integratietests (de 17 testcases van type I uit het testplan) staan in `tests/integration/`.

```bash
npm run db:up             # de databasecontainer moet draaien
npm run test:integration  # alle tests headless
```

- De tests gebruiken de database uit `DATABASE_URL_TEST` in `.env`. Die wordt bij de start
  aangemaakt als hij nog niet bestaat en gemigreerd. Laat hem nooit naar de ontwikkeldatabase
  wijzen: hij wordt voor elke test geleegd en opnieuw gevuld met de seed.
- Playwright bouwt de app en start hem op poort 3001. Een `npm run dev` op poort 3000 mag dus
  blijven draaien.
- Het HTML-rapport van de laatste run komt in `playwright-report/` (staat in `.gitignore`).

De testcases van type A zijn met een testpersoon uitgevoerd; zie de acceptatietest.

## Documentatie

- [Ontwerpdocument](docs/ontwerp/ontwerpdocument.md): user stories, acceptatiecriteria, ERD,
  diagrammen, wireframes en onderbouwing
- [Testplan](docs/testen/testplan.md)
- [Testrapport](docs/testen/testrapport.md)
- [Acceptatietest](docs/testen/acceptatietest.md)
- [Gebruikershandleiding](docs/gebruikershandleiding.md)
