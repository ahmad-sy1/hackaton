# hackaton

Examentraining B1-K1 (ontwerpen · realiseren · testen) — MBO-4 Software Developer, crebo 23243.

Zes casussen, elk in een pressure cooker van drie weken. Per casus doorloop je de volledige
kerntaak: eerst ontwerpen, dan bouwen, dan testen. Elke hackathon heeft zijn eigen map en zijn
eigen branch.

## Casussen

| Map | Casus | Domein |
|---|---|---|
| `h1-sportschool-de-kast/` | Sportschool "De Kast" | referentiecasus op examenniveau |
| `h2-hitchtracker/` | HitchTracker | taxi |
| `h3-gamejam/` | GameJam | games |
| `h4-avisi/` | Avisi dataplatform / Stegemann Vinyl | data |
| `h5-admin-admin/` | admin admin | security · OWASP |
| `h6-niet-zo-single/` | Niet-zo-single-feestje | Arduino · Tinkercad |

## De drie fasen

| Fase | Werkproces | Wat je oplevert |
|---|---|---|
| 1 — Ontwerpen | B1-K1-W2 | ERD, use case diagram, wireframes, activiteitendiagram, ontwerpdocument |
| 2 — Realiseren | B1-K1-W3 | werkende MVP van de kernflow, met dummydata |
| 3 — Testen | B1-K1-W4 | testplan, testrapport, demovideo |

Je bouwt niet de hele casus. Je kiest per casus een **kernflow** — een klein aantal user stories
dat samen één betekenisvolle handeling vormt — en die werk je volledig uit. Leg vóór Fase 2 met je
begeleider vast wélke acceptatiecriteria de 100%-basis vormen. Daarop wordt je functionaliteit
beoordeeld.

## Stack

- **TypeScript**
- **PostgreSQL** met **Drizzle ORM** — schema als TypeScript, migraties als SQL in git
- **ESLint · Prettier · tsc** voor codekwaliteit

Elke hackathon-map heeft zijn eigen `package.json`, config en `node_modules`. In de root staan
alleen deze README en de gedeelde `.gitignore`.

## Aan de slag

```bash
git clone https://github.com/ahmad-sy1/hackaton.git
cd hackaton/h1-sportschool-de-kast
npm install
cp .env.example .env    # vul je DATABASE_URL in
npm run db:push         # schema naar je lokale Postgres
npm run dev
```

## Scripts

Draai deze vóór elke commit. Rode output betekent: nog niet committen.

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier — schrijft aanpassingen weg
```

---

# Versiebeheer — afspraken

Versiebeheer is een **beoordeeld criterium** bij B1-K1-W3, en bij SD2020 zelfs een cruciaal
criterium. Een repo met twintig commits `update` op `main` kost je punten, ook als de code werkt.
Houd je daarom aan onderstaande afspraken.

## Branches

| Soort | Naam | Voorbeeld |
|---|---|---|
| Hackathon | `h<nr>-<casusnaam>` | `h1-sportschool-de-kast` |
| Feature | `h<nr>/<omschrijving>` | `h1/inchecken-pincode` |

Werkwijze:

1. Start elke hackathon met een branch vanaf `main`.
2. Werk per stuk functionaliteit op een feature-branch daarvandaan.
3. Merge de feature terug in de hackathon-branch zodra hij werkt.
4. Merge de hackathon-branch aan het eind in `main`.

Nooit rechtstreeks op `main` committen.

## Commits

Format: `<type>: <wat er is veranderd>`.

| Type | Waarvoor |
|---|---|
| `feat` | nieuwe functionaliteit |
| `fix` | bug opgelost |
| `docs` | documentatie of ontwerp |
| `refactor` | code opgeschoond, gedrag ongewijzigd |
| `test` | testcode of testdocumentatie |
| `chore` | config, dependencies, tooling |

Goed:

```
feat: bezoeklimiet per abonnementstype bij inchecken
fix: pincode met voorloopnul werd afgekapt
docs: ERD toegevoegd aan ontwerpdocument
```

Niet goed: `update`, `wijzigingen`, `asdf`, `eindversie2`.

Eén commit = één afgeronde gedachte. Commit vaker dan je denkt nodig te hebben; een commit per
werkuur is een goede vuistregel.

## Tags per fase

Zet aan het eind van elke fase een tag op de laatste commit. Dat is je inlevermoment — je
begeleider beoordeelt wat er op de tag staat.

```
h1-fase1    h1-fase2    h1-fase3
h2-fase1    h2-fase2    h2-fase3
```

## Commando's

```bash
# hackathon starten
git switch main
git switch -c h1-sportschool-de-kast

# feature-branch
git switch -c h1/inchecken-pincode
git add .
git commit -m "feat: inchecken met lidnummer en pincode"

# feature terug in de hackathon-branch
git switch h1-sportschool-de-kast
git merge h1/inchecken-pincode

# fase afsluiten
git tag h1-fase2
git push origin h1-sportschool-de-kast --tags

# hackathon afsluiten
git switch main
git merge h1-sportschool-de-kast
git push
```

## Waar je begeleider naar kijkt

- Zijn de versies herkenbaar en terug te halen?
- Is er een workflow **gekozen én toegepast**, of zijn het losse commits?
- Is per commit duidelijk wat er is veranderd?
- Sluit het schema in `db/schema.ts` aan op het ERD uit Fase 1?

## Wat je nooit commit

Geheimen horen niet in git. Ook niet "even tijdelijk" — ze blijven in de historie staan.

```
.env
.env.local
node_modules/
dist/
```

Gebruik `.env.example` met lege waarden als voorbeeld voor anderen.