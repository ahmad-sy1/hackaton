# Sportschool De Kast

Webapplicatie voor Sportschool De Kast (Hackathon 1, kernflow US-01 + US-02). De app heeft drie
schermen:

| Scherm          | Route         | Wat het doet                                                                                                                                                                                                                                               |
| --------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inchecken       | `/check-in`   | Een lid checkt bij de ingang in met lidnummer en pincode. Toegang hangt af van het abonnementstype (maximaal aantal bezoeken per week, telling vanaf maandag) en van een eventuele einddatum. Elke poging van een bekend lid wordt gelogd in `visit_logs`. |
| Mijn abonnement | `/abonnement` | Een lid logt in met lidnummer en pincode, bekijkt zijn abonnement en kan het opzeggen. Na bevestiging loopt de toegang door tot het einde van de lopende maandcyclus.                                                                                      |
| Beheer          | `/beheer`     | Een medewerker anonimiseert bezoeklogs ouder dan 14 dagen (AVG): het lidnummer wordt losgekoppeld, het abonnementstype blijft staan. Dit scherm heeft (bewust) nog geen login, zie het testrapport.                                                        |

De startpagina `/` linkt naar deze drie schermen.

## Stack

- **Next.js** (App Router) met **TypeScript** (strict) en **server actions**: geen aparte backend
- **PostgreSQL 17** in Docker, met **Drizzle ORM** voor schema, migraties en queries
- **Tailwind CSS** voor de opmaak
- **bcryptjs** voor het hashen van pincodes
- **Cypress** voor end-to-end-tests
- **ESLint**, **Prettier** en `tsc` voor codekwaliteit

## Projectstructuur

Drie lagen, elk met een eigen plek:

```
app/                      # FRONTEND — routing en UI (Next.js App Router)
  page.tsx                #   startpagina met links naar de schermen
  check-in/               #   incheckscherm (US-01)
  abonnement/             #   abonnement bekijken en opzeggen (US-02)
  beheer/                 #   bezoeklogs anonimiseren

src/
  db/                     # DATABASE — alles bij elkaar
    schema/               #   één bestand per tabel + index.ts (barrel)
      subscriptions.ts
      users.ts
      visit-logs.ts
    migrations/           #   gegenereerde SQL + meta/ (snapshots per migratie)
    index.ts              #   de Drizzle-client (import { db } from "@/src/db")
    seed.ts               #   testdata (M1 t/m M8)
  server/                 # BACKEND — server actions per feature
    <feature>/actions.ts  #   "use server", de ingang vanuit de UI
    <feature>/queries.ts  #   Drizzle-queries (geen raw SQL in componenten)
    <feature>/*.ts        #   businessregels, los van de database via een poort-interface
  lib/                    # helpers zonder laag-binding (datums)

cypress/
  e2e/                    # specs: inchecken, abonnement, integratie, beheer
  support/                # helpers voor database-queries en datumberekening

docs/testen/              # testplan, testrapport en acceptatietest
```

Nieuwe tabel: nieuw bestand in `src/db/schema/`, toevoegen aan `schema/index.ts`,
dan `npm run db:generate`. Nieuwe backend-functionaliteit: map onder `src/server/`.
Nieuw scherm: route-map onder `app/`.

## Installeren en starten

Alle commando's draai je in de map `h1-sportschool-de-kast/`, niet in de root van de repo.

Vereist: Node.js, npm en Docker.

```bash
npm install
cp .env.example .env      # in h1-sportschool-de-kast/, niet in de root van de repo
npm run db:up             # start PostgreSQL (container dekast-db) en wacht op de healthcheck
npm run db:migrate        # voert de migraties uit src/db/migrations/ uit
npm run db:seed           # vult de database met de testleden M1 t/m M8
npm run dev               # start de app op http://localhost:3000
```

De standaardwaarden in `.env.example` passen bij `docker-compose.yml`. In `.env` staan twee
variabelen:

| Variabele           | Waarvoor                                                       |
| ------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`      | De database waarmee de app (en `db:migrate` / `db:seed`) werkt |
| `DATABASE_URL_TEST` | De aparte testdatabase `dekast_test` voor Cypress              |

`.env` staat in `.gitignore` en wordt nooit gecommit.

Stoppen met `npm run db:down`: de data blijft bewaard in het volume `dekast-db-data`.
`npm run db:reset` wist de database en bouwt hem schoon opnieuw op (**alle data weg**).

## Commando's

Draai **`npm run check`** vóór elke commit.

| Script                                    | Wat het doet                                             |
| ----------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                             | Start de Next.js-dev-server                              |
| `npm run build` / `npm run start`         | Productie-build maken en draaien                         |
| `npm run lint` / `npm run lint:fix`       | ESLint (met `--fix`: automatisch oplossen)               |
| `npm run format` / `npm run format:check` | Prettier schrijven / alleen controleren                  |
| `npm run typecheck`                       | Route-types genereren en `tsc --noEmit`                  |
| `npm run check`                           | `format:check` + `lint` + `typecheck`                    |
| `npm run db:up` / `npm run db:down`       | Database-container starten / stoppen                     |
| `npm run db:logs`                         | Logs van de database volgen                              |
| `npm run db:generate`                     | Nieuwe migratie genereren na een schemawijziging         |
| `npm run db:migrate`                      | Migraties uitvoeren                                      |
| `npm run db:studio`                       | Drizzle Studio openen                                    |
| `npm run db:seed`                         | Testdata inladen (`src/db/seed.ts`)                      |
| `npm run db:reset`                        | Database wissen en opnieuw opbouwen (**wist alle data**) |
| `npm run cy:open` / `npm run cy:run`      | Cypress interactief / headless                           |

## Database

Het schema staat in `src/db/schema/` (één bestand per tabel), de client in `src/db/index.ts`.
Bij elke schemawijziging hoort een migratie (`npm run db:generate`). Een al gecommitte migratie
pas je niet aan; je schrijft een nieuwe.

| Tabel           | Doel                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Subscriptions` | De abonnementstypen (Basis, Plus, Premium). `subscription_limit` is het maximum aantal bezoeken per week.                                 |
| `Users`         | De leden: gegevens, een verwijzing naar het abonnementstype en `pin_hash` (de bcrypt-hash van de pincode, nooit de pincode zelf).         |
| `visit_logs`    | Elke toegangspoging van een bekend lid, geslaagd (`access_granted = true`) én geweigerd (`false`), met het abonnementstype op dat moment. |

NULL-conventies:

- `Subscriptions.subscription_limit` **NULL** = onbeperkt aantal bezoeken (Premium).
- `Users.subscription_end` **NULL** = niet opgezegd. Staat er een datum, dan is er opgezegd en
  geeft het abonnement toegang tot en met die datum.
- `visit_logs.user_id` **NULL** = geanonimiseerd. `subscription_type_id` blijft staan, zodat
  zichtbaar blijft welk abonnementstype er langskwam, zonder te weten wie het was.

Het aantal bezoeken per week is geen kolom. Het wordt bij elke incheck geteld in `visit_logs`,
vanaf maandag 00:00.

## Testen

De end-to-end-tests (TC-01 t/m TC-15) staan in `cypress/e2e/`. Elke test vult de testdatabase
vóór en na de test opnieuw via `cy.task("seed")`. De tests raken de ontwikkeldatabase dus niet.

**Belangrijk:** Cypress zet de testdatabase alleen voor zijn eigen proces (seed en
database-controles). De app draait in een apart proces en moet zelf ook met de testdatabase
gestart worden. Anders praten de seed en de app met verschillende databases en falen de tests.

Eenmalig: de testdatabase aanmaken en migreren.

```bash
docker exec dekast-db createdb -U dekast dekast_test
DATABASE_URL="$(grep '^DATABASE_URL_TEST=' .env | cut -d= -f2-)" npm run db:migrate
```

Tests draaien, in twee terminals:

```bash
# terminal 1: app tegen de testdatabase
DATABASE_URL="$(grep '^DATABASE_URL_TEST=' .env | cut -d= -f2-)" npm run dev

# terminal 2: alle specs headless
npm run cy:run
```

Er kan maar één Next-dev-server tegelijk draaien in deze map. Stop dus eerst een dev-server die
tegen de ontwikkeldatabase draait.

Testplan, testrapport en acceptatietest staan in [`docs/testen/`](docs/testen/).

## Testleden

De seed (`src/db/seed.ts`) maakt acht testleden aan. De lidnummers liggen vast, omdat de seed
de tabellen leegmaakt met `RESTART IDENTITY`. Alle datums worden berekend ten opzichte van de dag
waarop de seed draait. De pincode staat in `src/db/seed.ts`; alleen voor de dev- en
testomgeving.

| Profiel | Lidnummer | Abonnement          | Situatie                                                                                                                            |
| ------- | --------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| M1      | 1         | Plus (2 per week)   | 0 bezoeken deze week, niet opgezegd, startdatum op de 5e van de maand. Heeft één bezoeklog van 21 dagen oud (voor het anonimiseren) |
| M2      | 2         | Plus (2 per week)   | 2 geslaagde bezoeken deze week: limiet bereikt                                                                                      |
| M3      | 3         | Plus (2 per week)   | 1 geslaagd bezoek deze week: nog ruimte                                                                                             |
| M4      | 4         | Premium (onbeperkt) | 3 geslaagde bezoeken deze week                                                                                                      |
| M5      | 5         | Plus (2 per week)   | 2 geslaagde bezoeken vóór afgelopen maandag, 0 deze week                                                                            |
| M6      | 6         | Plus (2 per week)   | Opgezegd, einddatum over 12 dagen: heeft nog toegang                                                                                |
| M7      | 7         | Plus (2 per week)   | Opgezegd, einddatum was gisteren: abonnement verlopen                                                                               |
| M8      | 8         | Plus (2 per week)   | Startdatum op dezelfde dag van de maand als vandaag, niet opgezegd                                                                  |

Daarnaast bevat de seed één al geanonimiseerde bezoeklog (40 dagen oud, `user_id` NULL). Het
abonnementstype Basis (1 per week) bestaat wel, maar geen enkel testlid gebruikt het.
