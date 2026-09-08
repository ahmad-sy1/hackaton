This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

De datalaag draait op PostgreSQL met [Drizzle ORM](https://orm.drizzle.team).
Het schema staat in `src/db/schema.ts`, de client in `src/db/index.ts`.

### Tabellen

| Tabel | Doel |
| --- | --- |
| `Subscriptions` | De abonnementstypen (Basis, Plus, Premium). `subscription_limit` is het maximum aantal bezoeken per week. |
| `Users` | De leden. Bevat NAW-gegevens, een verwijzing naar het abonnementstype, en `pin_hash` (de bcrypt-hash van de pincode, nooit de pincode zelf). |
| `visit_logs` | Elke toegangspoging bij de deur, geslaagd (`access_granted = true`) én geweigerd (`false`). `subscription_type_id` legt vast met welk abonnementstype er is aangeklopt. |

### NULL-conventies

- `Subscriptions.subscription_limit` **NULL** = onbeperkt aantal bezoeken (Premium).
- `Users.subscription_end` **NULL** = het abonnement is niet opgezegd. Staat er wél
  een datum, dan is er opgezegd en loopt het abonnement door tot die datum.

### Waarom is `visit_logs.user_id` nullable?

Bezoeklogs worden na 14 dagen geanonimiseerd: `user_id` wordt dan op NULL gezet
(de foreign key staat op `ON DELETE set null`). `subscription_type_id` blijft
staan, zodat de sportschool nog kan zien wélk abonnementstype er langskwam zonder
te weten wie het was.

### Lokaal opstarten

Er is geen kant-en-klare database; je draait er zelf een. De meegeleverde
`docker-compose.yml` start een PostgreSQL 17 met vaste gegevens:

| | |
| --- | --- |
| gebruiker | `dekast` |
| wachtwoord | `dekast` |
| databasenaam | `dekast` |
| poort | `5432` |

Deze komen exact overeen met de `DATABASE_URL` in `.env.example`, dus na kopiëren
werkt het meteen:

```bash
cp .env.example .env      # standaardwaarde past al bij docker-compose.yml
docker compose up -d      # start PostgreSQL (Docker Desktop moet draaien)
npm run db:migrate        # voert drizzle/0000_init.sql uit
npm run db:seed           # vult de database met testdata
```

Stoppen met `docker compose down` (data blijft bewaard in het volume
`dekast-db-data`); `docker compose down -v` wist ook de data.

Geen Docker? Dan zet je zelf een PostgreSQL op (bijv. Postgres.app of Homebrew),
maak je een lege database aan en pas je `DATABASE_URL` in `.env` aan naar
`postgres://<user>:<wachtwoord>@<host>:<poort>/<databasenaam>`.

Overige scripts: `npm run db:generate` (nieuwe migratie genereren uit het schema)
en `npm run db:studio` (Drizzle Studio).

### Testleden

Alle testleden hebben pincode **1234** (alleen voor de dev-omgeving).

| Lid | Abonnement | Situatie in de seed | Dekt af |
| --- | --- | --- | --- |
| Sanne de Vries | Basis (1/week) | Laatste bezoek was vorige week | Weekteller reset op maandag: vorige week telt niet mee, Sanne mag er weer in |
| Mo El Amrani | Basis (1/week) | Deze week al één geslaagd bezoek + één geweigerde poging | Weeklimiet bereikt → volgende poging wordt geweigerd én de weigering wordt gelogd |
| Youssef Bakker | Plus (2/week) | Deze week één bezoek | Nog ruimte binnen de weeklimiet → toegang wordt verleend |
| Lisa Jansen | Premium (onbeperkt) | Drie bezoeken deze week | `subscription_limit` NULL → nooit geweigerd op aantal |
| Karim Yilmaz | Plus (2/week) | `subscription_end` in de toekomst | US-02: opgezegd abonnement dat nog doorloopt tot de vervaldatum → nog steeds toegang |
| Nadia Peters | Basis (1/week) | Bezoeklog van 21 dagen oud | Testcase voor de anonimiseerknop (logs ouder dan 14 dagen) |

Daarnaast bevat de seed één al geanonimiseerde bezoeklog (`user_id` NULL,
`subscription_type_id` bewaard) als voorbeeld van de eindtoestand na anonimisering.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
