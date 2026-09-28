# CLAUDE.md — werkregels voor deze repo

Dit is een onderwijsrepo voor de module **Hackaton** (mbo-4 Software Developer, kerntaak B1-K1).
Elke hackaton heeft een eigen map en een eigen branch. Actieve casus: `h1-sportschool-de-kast/`.

De eigenaar van deze repo (Ahmad) is docent en eindverantwoordelijke. Jij bent uitvoerder, geen beslisser.

---

## 1. Git-attributie — hard

- Voeg **nooit** `Co-Authored-By: Claude <noreply@anthropic.com>` toe aan een commit.
- Voeg **nooit** een `🤖 Generated with Claude Code`-regel toe aan een commit of PR-body.
- Verander **nooit** de git-author of `user.email`. De author is altijd de repo-eigenaar.
- Commitberichten bevatten geen verwijzing naar AI, tooling of prompts.

Reden: dit is examentrainingsmateriaal. De historie moet leesbaar zijn als een schoolopdracht,
niet als een tool-log.

## 2. Commits

- **Conventional Commits**, kleine letters, Engels, scope = hackaton-nummer:
  `feat(h1): ...`, `fix(h1): ...`, `chore(h1): ...`, `docs(h1): ...`, `test(h1): ...`, `refactor(h1): ...`, `style(h1): ...`, `ci(h1): ...`
- Eén logische wijziging per commit. Niet vijf losse dingen in één commit proppen.
- Onderwerpregel max ~72 tekens, gebiedende wijs, geen punt aan het eind.
- Stage **alleen bestanden die bij die commit horen**. Geen `git add .` en geen `git commit -a`
  zonder eerst `git status` te lezen en te melden wat er meegaat.
- Nooit `--no-verify`. Als een hook of check faalt: los het op of meld het, sla het niet over.

## 3. Branches, tags en pushen

- Nooit direct committen op `main`.
- Basisbranch per casus: `h1-sportschool-de-kast`. Featurebranches daaronder: `h1/inchecken-pincode`.
- **Vraag altijd toestemming voor je pusht.** Nooit ongevraagd pushen.
- Nooit `push --force`, nooit `--force-with-lease`, nooit rebasen of history herschrijven
  op een branch die al gepusht is.
- Nooit `git reset --hard`, `git checkout .` of `git clean` zonder expliciete opdracht —
  dat gooit werk weg dat je niet terughaalt.
- **Tags maak of verplaats je nooit zelf.** Tags (`h1-fase1`, `h1-fase2`, `h1-fase3`) zijn
  inlevermomenten en zet de docent handmatig.
- Geen PR's openen, mergen of sluiten zonder expliciete opdracht.

## 4. Scope

- Werk alleen in de map van de actieve hackaton. Kom niet aan `h2-*` t/m `h6-*` of aan
  documenten buiten die map, tenzij daar expliciet om gevraagd wordt.
- Bouw **alleen** wat gevraagd is. De 100%-basis van H1 fase 2 zijn de negen acceptatiecriteria
  van US-01 (toegang op abonnementstype) en US-02 (abonnement annuleren). Geen extra features,
  geen "handig meegenomen" schermen, geen bonusfunctionaliteit.
- Geen ongevraagde refactors, hernoemingen of "opruimacties" in code die verder niets met de
  taak te maken heeft.
- Geen nieuwe dependencies installeren zonder te vragen. Elke package is straks uit te leggen
  aan een examinator.

## 5. Techniek

Vaste stack, niet ter discussie tenzij ik erover begin:

- TypeScript (strict), Next.js App Router met **server actions** — geen aparte backend.
- PostgreSQL met **Drizzle ORM**. Geen raw SQL in componenten.
- ESLint + Prettier + `tsc --noEmit`.
- Draai `npm run check` (lint, format, typecheck) **voor** elke commit. Committen met rode checks doe je niet.
- Migraties die al gecommit zijn wijzig je niet — je schrijft een nieuwe.
- Genereerde bestanden (`.next/`, `node_modules/`, drizzle-output) niet handmatig aanpassen.

## 6. Security & privacy (casus-specifiek, telt mee in de beoordeling)

- Pincode: **nooit plaintext**, **nooit `int`** (leidende nullen gaan verloren). `varchar` + hashing.
- Validatie hoort op **twee plekken**: frontend voor bruikbaarheid, server action voor echte veiligheid.
  Frontend-validatie is nooit de beveiliging.
- Nooit secrets, `.env`-inhoud, wachtwoorden of connectionstrings in code, commits of README.
  `.env` staat in `.gitignore` en blijft daar.
- Bezoekaantal wordt **afgeleid via een query** op `visit_logs` vanaf afgelopen maandag —
  geen tellerkolom, geen resetlogica.
- Anonimiseren van bezoeklogs ouder dan 14 dagen gebeurt via een **handmatige knop** in het
  beheerscherm (`UPDATE visit_logs SET user_id = NULL WHERE ...`), niet via een cronjob.
- Geen echte persoonsgegevens in seeds of testdata. Verzonnen namen, verzonnen e-mailadressen.

## 7. Het ontwerp is leidend

- Het ontwerpdocument (ERD in DBML, use case diagram en activiteitendiagram in PlantUML,
  wireframes) is de bron van waarheid. De code volgt het ontwerp.
- Wijkt de implementatie ergens af, of klopt het ontwerp niet? **Melden, niet stilletjes oplossen.**
  Een afwijking tussen ontwerp en code kost punten bij de beoordeling.
- Verzin geen extra tabellen, kolommen of relaties die niet in de ERD staan.

## 8. Werkwijze en communicatie

- Nederlands, kort, direct. Geen lange samenvattingen van wat je net gedaan hebt.
- Plan eerst, voer daarna uit. Bij een taak van meer dan een paar bestanden: zeg in twee regels
  wat je gaat doen, wacht op akkoord.
- Weet je iets niet zeker: **vraag het, één vraag tegelijk**. Niet gokken en doorgaan.
- Geen bestanden aanmaken die niet nodig zijn — zeker geen ongevraagde README's,
  samenvattingen of `NOTES.md`.
- Code en commentaar in de codebase zijn Engels; documentatie voor studenten is Nederlands.
- Commentaar in de code is spaarzaam en legt *waarom* uit, niet *wat*.

## 9. Nooit doen

- Bestanden of branches verwijderen zonder expliciete opdracht.
- Werkende code "verbeteren" die buiten de opdracht valt.
- Tests uitzetten, skippen of aanpassen zodat ze slagen.
- Een falende check wegpoetsen met `any`, `// @ts-ignore` of `eslint-disable`.
- Beweren dat iets werkt zonder het gedraaid te hebben.
