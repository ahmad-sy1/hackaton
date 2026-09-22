<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Projectstructuur

Drie lagen, elk met een vaste plek. Volledige uitleg in `README.md` (§ Projectstructuur).

- `app/` — **frontend**: routes, pagina's, layouts. Gedeelde componenten in `app/_components/`.
- `src/db/` — **database**: `schema/` (één bestand per tabel + `index.ts` barrel),
  `migrations/` (gegenereerde SQL + `meta/` snapshots), `index.ts` (client), `seed.ts`.
- `src/server/<feature>/` — **backend**: `actions.ts` (`"use server"`, mutaties),
  `queries.ts` (Drizzle-reads). Geen raw SQL in componenten.
- `src/lib/` — helpers zonder laag-binding.

`src/db/migrations/` bevat inlevermomenten van het schema: nooit met de hand wijzigen,
altijd via `npm run db:generate` na een schemawijziging.

## Schema-workflow — hard

Eén tabel per bestand in `src/db/schema/`. **Elke keer** dat een tabelbestand wordt
aangemaakt of gewijzigd:

1. Voeg de tabel toe aan `src/db/schema/index.ts` (de barrel).
2. Draai `npm run db:generate`.
3. Controleer de gegenereerde SQL in `src/db/migrations/` vóór je commit.

Nooit een tabel toevoegen zonder migratie. Nooit een al gecommitte migratie
aanpassen — schrijf een nieuwe.
