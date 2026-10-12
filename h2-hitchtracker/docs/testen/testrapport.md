# Testrapport HitchTracker (Hackathon 2, fase 3)

|                      |                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Werkproces           | B1-K1-W4: Test software                                                                                                                                                                                                                                                                                                                         |
| Kernflow             | US-01 (Ritschatting vooraf) + US-02 (Eindprijs controleren)                                                                                                                                                                                                                                                                                     |
| Datum integratietest | 8 oktober 2026, 11:03:59–11:04:13 (CEST)                                                                                                                                                                                                                                                                                                        |
| Datum acceptatietest | 8 oktober 2026                                                                                                                                                                                                                                                                                                                                  |
| Geteste stand        | Applicatiecode gelijk aan tag `h2-fase2` (`7d92600`): `src/` en `app/` zijn daarna niet gewijzigd (`git diff h2-fase2 origin/h2-hitchtracker -- h2-hitchtracker/src h2-hitchtracker/app` is leeg). De testcode staat in `83e5173` t/m `243467b` (branch `h2/integratietest`) en is direct na de run gecommit                                    |
| Uitvoerders          | Integratietest: Ahmad Alasmi. Acceptatietest: testpersoon O.A., begeleid door Ahmad Alasmi                                                                                                                                                                                                                                                      |
| Testomgeving         | Integratietest: Playwright 1.63.0, Chromium 153.0.8010.12 (headless, profiel Desktop Chrome, 1280 × 800), productiebuild Next.js 16.3.4 (`next start`, poort 3001), PostgreSQL 17 in `hitchtracker-db` met de aparte testdatabase `hitchtracker_test`. Acceptatietest: Chrome op een laptop, venster 1280 × 800, app op `http://localhost:3000` |
| Testplan             | [testplan.md](./testplan.md) (6 oktober 2026)                                                                                                                                                                                                                                                                                                   |
| Acceptatietest       | [acceptatietest.md](./acceptatietest.md) (8 oktober 2026)                                                                                                                                                                                                                                                                                       |

Nummering van testcases (TC-01 t/m TC-28), acceptatiecriteria (AC-01.1 t/m AC-02.4), de
ontwerpkeuze OK-01 en de fixtures (F-0, F-NEG, F-20, F-20+) volgt het testplan.

**Toolkeuze.** Hoofdstuk 2 van het testplan legt de keuze van de testtool vast bij de
uitvoering. De integratietests zijn geautomatiseerd met Playwright (`@playwright/test`). Playwright
bedient de applicatie via de browser, zoals een reiziger dat doet, en kan in dezelfde test de
database lezen en fixtures klaarzetten. Zo wordt het hele pad scherm → server action → database
getoetst, waar volgens het testplan het risico zit. De tests draaien tegen een aparte testdatabase
(`hitchtracker_test`, ingesteld met `DATABASE_URL_TEST` in `.env`). Die wordt voor elke test geleegd
en opnieuw gevuld, zodat de ontwikkeldatabase nooit wordt aangeraakt. De tests draaien één voor
één (`workers: 1`), omdat ze die ene testdatabase delen. Starten: `npm run test:integration`.

**Hoe te lezen.** Elke testcase is uitgevoerd door de testvorm die het testplan aangeeft: de
17 testcases van type I door de integratietest, de 11 testcases van type A door de acceptatietest.
Bij de integratietest verwijst het werkelijk resultaat naar de assertion in de spec die de stap
controleert. Regelnummers verwijzen naar commit `243467b`. TC-10 stap 3 (de serverlog) is tijdens
dezelfde run met de hand gecontroleerd. Bij de acceptatietest is het werkelijk resultaat
overgenomen uit het ingevulde formulier. "Scenario 2.3" betekent: paragraaf 2 van het formulier,
derde regel. Een stap waarvan het formulier geen resultaat bevat,
staat als **Niet vastgelegd**: daar is niets ingevuld en niets aangenomen (paragraaf 5.3 punt 1).

## 1. Samenvatting

|                                        | Aantal                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------- |
| Testcases in het testplan              | 28                                                                        |
| Uitgevoerd met de integratietest (I)   | 17                                                                        |
| Uitgevoerd met de acceptatietest (A)   | 11                                                                        |
| Niet uitgevoerd                        | 0                                                                         |
| Geslaagd, alle stappen vastgelegd      | 21                                                                        |
| Geslaagd, deels vastgelegd             | 7 (TC-01, TC-02, TC-04, TC-06, TC-11, TC-13, TC-23; paragraaf 5.3 punt 1) |
| Niet geslaagd                          | 0                                                                         |
| Met de hand gecontroleerde teststappen | 1 (TC-10 stap 3, conform)                                                 |
| Bugs gevonden tijdens het testen       | 0                                                                         |

Playwright-uitvoer per spec:

| Spec                  | Tests  | Geslaagd | Gefaald | TC's                                                   |
| --------------------- | ------ | -------- | ------- | ------------------------------------------------------ |
| `estimate.spec.ts`    | 7      | 7        | 0       | TC-03, TC-05, TC-07, TC-08, TC-09, TC-10, TC-12        |
| `final-price.spec.ts` | 8      | 8        | 0       | TC-15, TC-16, TC-17, TC-18, TC-21, TC-22, TC-25, TC-26 |
| `cleanup.spec.ts`     | 2      | 2        | 0       | TC-27, TC-28                                           |
| **Totaal**            | **17** | **17**   | **0**   | duur 13,8 s                                            |

Acceptatietest: alle 11 scenario's zijn "Conform verwacht". De testpersoon is nergens vastgelopen
en had geen hulp nodig. De usability-vragen zijn beantwoord met een 5, vier keer een 4 en een 3
(paragraaf 5.3 punt 2).

## 2. Testcases

Testcases van type I: uitgevoerd door Ahmad Alasmi op 08-10-2026, specs in `tests/integration/`.
Testcases van type A: uitgevoerd door testpersoon O.A. op 08-10-2026, met het formulier in
`docs/testen/acceptatietest.md`.

### TC-01 | Leeg formulier geeft een melding

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-01.1 · Soort: A · Test status: **Geslaagd, stap 1 en de URL in stap 3 niet vastgelegd**

| Stap | Test stap                                          | Verwacht resultaat                                                                         | Werkelijk resultaat                                                                      | Geslaagd/niet geslaagd |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Ga naar het startscherm                            | Kop "Waar wil je naartoe?" met twee keuzevelden en de knop "Schatting opvragen"            | Niet vastgelegd                                                                          | Niet vastgelegd        |
| 2    | Klik op "Schatting opvragen" zonder iets te kiezen | Melding "Kies een vertrekpunt en een bestemming."; beide keuzevelden krijgen een rode rand | Conform verwacht (acceptatietest, scenario 2.1)                                          | Geslaagd               |
| 3    | Controleer de URL                                  | De URL is nog steeds `/`; er verschijnt geen schatting                                     | Er verschijnt geen schatting: conform verwacht (scenario 2.1). De URL is niet vastgelegd | Deels vastgelegd       |

### TC-02 | Alleen een vertrekpunt geeft een melding

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-01.1 · Soort: A · Test status: **Geslaagd, stap 1 en de URL in stap 3 niet vastgelegd**

| Stap | Test stap                    | Verwacht resultaat                                                       | Werkelijk resultaat                                                                      | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Kies alleen een vertrekpunt  | Het vertrekpunt is gekozen; de bestemming staat op "Kies een bestemming" | Niet vastgelegd                                                                          | Niet vastgelegd        |
| 2    | Klik op "Schatting opvragen" | Melding "Kies een vertrekpunt en een bestemming."                        | Conform verwacht (scenario 2.2)                                                          | Geslaagd               |
| 3    | Controleer de URL            | De URL is nog steeds `/`; er verschijnt geen schatting                   | Er verschijnt geen schatting: conform verwacht (scenario 2.2). De URL is niet vastgelegd | Deels vastgelegd       |

### TC-03 | Gemanipuleerde URL's geven geen schatting

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.1
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                        | Verwacht resultaat                                                                                                                     | Werkelijk resultaat                                                                                                                              | Geslaagd/niet geslaagd |
| ---- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 1    | Open elk van de zes URL's direct | Kop "Geen schatting mogelijk", de melding "Kies een vertrekpunt en een bestemming." en de knop "Terug naar start"; er staat geen prijs | Conform verwacht voor alle zes URL's, elk als eigen `test.step` (`estimate.spec.ts:13`–`:35`; geen prijs: er staat geen "€" op de pagina, `:34`) | Geslaagd               |
| 2    | Controleer het aantal ritten     | 0                                                                                                                                      | 0 (`estimate.spec.ts:38`)                                                                                                                        | Geslaagd               |

### TC-04 | Schatting Centraal Station → Schiphol

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-01.2 · Soort: A · Test status: **Geslaagd, stap 1 en de URL in stap 2 niet vastgelegd**

| Stap | Test stap                              | Verwacht resultaat                                                   | Werkelijk resultaat                                                                           | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Kies vertrekpunt en bestemming         | Beide keuzes staan in de velden                                      | Niet vastgelegd                                                                               | Niet vastgelegd        |
| 2    | Klik op "Schatting opvragen"           | De URL is `/estimate?from=1&to=2`; kop "Centraal Station → Schiphol" | Kop "Centraal Station → Schiphol": conform verwacht (scenario 1.1). De URL is niet vastgelegd | Deels vastgelegd       |
| 3    | Lees de verwachte prijs en reistijd af | Prijs `± € 53,80`; daaronder `ca. 25 minuten · 17 km`                | Conform verwacht (scenario 1.1)                                                               | Geslaagd               |

### TC-05 | Schatting met een afstand met decimaal

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.2
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                    | Verwacht resultaat                                      | Werkelijk resultaat                                          | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ---------------------- |
| 1    | Vraag een schatting op       | Prijs `± € 34,60`; daaronder `ca. 16 minuten · 10,5 km` | Conform verwacht, exacte tekst (`estimate.spec.ts:46`–`:49`) | Geslaagd               |
| 2    | Controleer het aantal ritten | 0                                                       | 0 (`estimate.spec.ts:50`)                                    | Geslaagd               |

### TC-06 | Gebruikt tarief is zichtbaar

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-01.3 · Soort: A · Test status: **Geslaagd, stap 3 niet vastgelegd**

| Stap | Test stap                             | Verwacht resultaat                                                                         | Werkelijk resultaat             | Geslaagd/niet geslaagd |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------- | ---------------------- |
| 1    | Bekijk het blok rechts naast de prijs | Kop "Gebruikt tarief (Amsterdam)" met Starttarief € 3,00, Per km € 2,40, Per minuut € 0,40 | Conform verwacht (scenario 1.2) | Geslaagd               |
| 2    | Lees de tekst onder het blok          | "De eindprijs wordt met dit tarief berekend."                                              | Conform verwacht (scenario 1.2) | Geslaagd               |
| 3    | Reken de prijs na                     | 300 + 17 × 240 + 25 × 40 = 5380 cent = € 53,80, gelijk aan de getoonde prijs               | Niet vastgelegd                 | Niet vastgelegd        |

### TC-07 | Berekening voor een tweede route

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.3
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap              | Verwacht resultaat                                                                                                        | Werkelijk resultaat                                                                                                   | Geslaagd/niet geslaagd |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Vraag een schatting op | Prijs `± € 17,00` (300 + 4 × 240 + 11 × 40 = 1700 cent); daaronder `ca. 11 minuten · 4 km`; "Gebruikt tarief (Amsterdam)" | Conform verwacht: prijs en reistijd als exacte tekst (`estimate.spec.ts:59`–`:62`), tariefkop (`estimate.spec.ts:63`) | Geslaagd               |

### TC-08 | Accepteren legt precies één rit vast

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.4
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                      | Verwacht resultaat                                                                                                                                                      | Werkelijk resultaat                                                                                                                         | Geslaagd/niet geslaagd |
| ---- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open de schatting              | Schattingsscherm met `± € 53,80`                                                                                                                                        | Conform verwacht (`estimate.spec.ts:70`)                                                                                                    | Geslaagd               |
| 2    | Klik op "Schatting accepteren" | De URL is `/ride/{uuid}`; het scherm toont "Rit is bezig" en "Vastgelegde schatting € 53,80"                                                                            | Conform verwacht: URL volgens het patroon `/ride/` + uuid van 36 tekens (`estimate.spec.ts:74`), kop en vastgelegde schatting (`:75`–`:79`) | Geslaagd               |
| 3    | Controleer de database         | Precies 1 rit met de uuid uit de URL: status `geaccepteerd`, `tariff_id` = 1, 17000 / 1500 / 5380; `actual_distance_m`, `actual_duration_s` en `final_price_cents` leeg | Conform verwacht: 1 rit (`estimate.spec.ts:82`), opgehaald met de uuid uit de URL, met precies deze waarden (`:81`–`:93`)                   | Geslaagd               |

### TC-09 | Niet accepteren slaat niets op

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.4
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                    | Verwacht resultaat               | Werkelijk resultaat                              | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | -------------------------------- | ------------------------------------------------ | ---------------------- |
| 1    | Open de schatting            | Schattingsscherm met `± € 53,80` | Conform verwacht (`estimate.spec.ts:100`)        | Geslaagd               |
| 2    | Klik op "Terug"              | Het startscherm `/` staat open   | Conform verwacht (`estimate.spec.ts:102`–`:104`) | Geslaagd               |
| 3    | Controleer het aantal ritten | 0                                | 0 (`estimate.spec.ts:105`)                       | Geslaagd               |

### TC-10 | Ongeldige of onbekende ritlink geeft 404

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.4
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap               | Verwacht resultaat                                           | Werkelijk resultaat                                                                                                                                                                                                                                              | Geslaagd/niet geslaagd |
| ---- | ----------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open een ongeldige uuid | HTTP-status 404 met de tekst "This page could not be found." | Conform verwacht voor `/ride/abc` (`estimate.spec.ts:117`–`:121`)                                                                                                                                                                                                | Geslaagd               |
| 2    | Open een onbekende uuid | HTTP-status 404 met de tekst "This page could not be found." | Conform verwacht voor de nul-uuid (`estimate.spec.ts:117`–`:121`)                                                                                                                                                                                                | Geslaagd               |
| 3    | Controleer de serverlog | Geen databasefout                                            | Met de hand gecontroleerd tijdens de run (08-10-2026): de serverlog is opgevangen met `DEBUG=pw:webserver`. Na "Ready" heeft de server niets gelogd, dus geen databasefout en geen `invalid input syntax for type uuid`, ook niet bij `/ride/abc` en de nul-uuid | Geslaagd               |

### TC-11 | Rotterdam geeft een melding dat er geen schatting mogelijk is

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-01.5 · Soort: A · Test status: **Geslaagd, stap 1, de URL in stap 2 en het verdwijnen van de
melding in stap 3 niet vastgelegd**

| Stap | Test stap                      | Verwacht resultaat                                                                                                                                                  | Werkelijk resultaat                                                                                | Geslaagd/niet geslaagd |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Kies vertrekpunt en bestemming | Beide keuzes staan in de velden                                                                                                                                     | Niet vastgelegd                                                                                    | Niet vastgelegd        |
| 2    | Klik op "Schatting opvragen"   | De URL blijft `/`; oranje melding "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk."; de knop "Schatting opvragen" is grijs en niet klikbaar | Melding en grijze knop: conform verwacht (scenario 2.3). De URL is niet vastgelegd                 | Deels vastgelegd       |
| 3    | Kies een ander vertrekpunt     | De melding verdwijnt en de knop is weer blauw en klikbaar                                                                                                           | Knop weer blauw: conform verwacht (scenario 2.3). Het verdwijnen van de melding is niet vastgelegd | Deels vastgelegd       |

### TC-12 | Rotterdam via de URL geeft geen schatting

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-01.5
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                    | Verwacht resultaat                                                                                                                                       | Werkelijk resultaat                                                                                  | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open de URL direct           | Kop "Geen schatting mogelijk" met de melding "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk."; geen knop "Schatting accepteren" | Conform verwacht: kop en melding (`estimate.spec.ts:131`–`:138`), geen accepteerknop (`:139`–`:141`) | Geslaagd               |
| 2    | Controleer het aantal ritten | 0                                                                                                                                                        | 0 (`estimate.spec.ts:142`)                                                                           | Geslaagd               |

### TC-13 | Afronden toont eindprijs, afstand en ritduur

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-02.1 · Soort: A · Test status: **Geslaagd, de URL in stap 1 niet vastgelegd**

| Stap | Test stap                                                             | Verwacht resultaat                                         | Werkelijk resultaat                                                                          | Geslaagd/niet geslaagd |
| ---- | --------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Klik in het demoblok op "Rit afronden: normaal (simulatie chauffeur)" | Dezelfde URL toont "Rit afgerond"                          | "Rit afgerond": conform verwacht (scenario 3.1). Dat het dezelfde URL is, is niet vastgelegd | Deels vastgelegd       |
| 2    | Lees eindprijs, afstand en ritduur af                                 | Eindprijs € 56,34; Gereden afstand 17,9 km; Ritduur 26 min | Conform verwacht: Eindprijs € 56,34, Gereden afstand 17,9 km, Ritduur 26 min (scenario 3.1)  | Geslaagd               |

### TC-14 | Ritlink later opnieuw openen

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-02.1 · Soort: A · Test status: **Geslaagd**

| Stap | Test stap                                     | Verwacht resultaat                                                         | Werkelijk resultaat                                                                                                                                                                   | Geslaagd/niet geslaagd |
| ---- | --------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Sluit het tabblad                             | Het tabblad is dicht                                                       | Conform verwacht (scenario 3.4)                                                                                                                                                       | Geslaagd               |
| 2    | Open de gekopieerde link in een nieuw tabblad | "Rit afgerond" met dezelfde waarden als in TC-13; er is geen demoblok meer | Conform verwacht: de link `/ride/a55eb698-15a6-4eaa-bcaf-75924b53dc5e` toont in een nieuw tabblad hetzelfde eindprijsscherm met Eindprijs € 56,34; het demoblok is weg (scenario 3.4) | Geslaagd               |

### TC-15 | Eindprijs wordt door het systeem berekend

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.2
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                           | Verwacht resultaat                                                                                                                                             | Werkelijk resultaat                                                                                                                                                                                                                                  | Geslaagd/niet geslaagd |
| ---- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Rond de rit af met scenario normaal | POST naar de server action; van de eigen velden komen alleen de rit-id en het veld `scenario` met waarde `normal` uit de browser; geen bedrag, afstand of duur | Conform verwacht: het verzoek bevat precies de velden `0` en `_1_scenario`; `_1_scenario` = `normal`; het eerste element van `0` is de rit-id; de waarden 5634, 56,34, 17850 en 1575 komen niet in het verzoek voor (`final-price.spec.ts:50`–`:64`) | Geslaagd               |
| 2    | Controleer de database              | Status `afgerond`; `actual_distance_m` = 17850; `actual_duration_s` = 1575; `final_price_cents` = 5634; `completed_at` gevuld                                  | Conform verwacht (`final-price.spec.ts:69`–`:77`), na de kop "Rit afgerond" (`:66`–`:68`)                                                                                                                                                            | Geslaagd               |
| 3    | Reken de eindprijs na               | 300 + 17,85 × 240 + 26,25 × 40 = 5634 cent                                                                                                                     | Conform verwacht: de opgeslagen eindprijs is 5634 cent, gelijk aan deze berekening (`final-price.spec.ts:70`–`:75`)                                                                                                                                  | Geslaagd               |

### TC-16 | Vervangen tarief verandert de eindprijs niet

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.2
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                                                    | Verwacht resultaat                                    | Werkelijk resultaat                                                                                                                                     | Geslaagd/niet geslaagd |
| ---- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Zet tarief 1 op inactief en voeg een nieuw actief tarief toe | Tarief 1 inactief; nieuw tarief actief voor Amsterdam | Voorbereiding met de fixture `replaceAmsterdamTariff` (`support/test-database.ts:88`–`:97`, aangeroepen in `final-price.spec.ts:84`); geen controlestap | n.v.t. (voorbereiding) |
| 2    | Rond de rit af met scenario normaal                          | Eindprijsscherm met € 56,34                           | Conform verwacht (`final-price.spec.ts:86`–`:88`)                                                                                                       | Geslaagd               |
| 3    | Controleer de database                                       | `final_price_cents` = 5634; `tariff_id` = 1           | Conform verwacht (`final-price.spec.ts:89`–`:90`)                                                                                                       | Geslaagd               |

### TC-17 | Gemanipuleerd scenario wordt geweigerd

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.2
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                                                         | Verwacht resultaat                                                                          | Werkelijk resultaat                                                                                                                                                                                    | Geslaagd/niet geslaagd |
| ---- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 1    | Pas de waarde van de knop "normaal" aan en verstuur het formulier | Het verzoek bereikt de server; het scherm toont nog "Rit is bezig"                          | Conform verwacht: de knopwaarde is in de browser op `free` gezet (`final-price.spec.ts:97`–`:101`), het verzoek met `free` heeft de server bereikt (`:103`–`:111`), kop "Rit is bezig" (`:112`–`:114`) | Geslaagd               |
| 2    | Controleer de database                                            | Status `geaccepteerd`; `actual_distance_m`, `actual_duration_s` en `final_price_cents` leeg | Conform verwacht (`final-price.spec.ts:115`–`:121`)                                                                                                                                                    | Geslaagd               |

### TC-18 | Dubbel afronden vanuit twee tabbladen verandert niets

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.2
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                                           | Verwacht resultaat                                                                                                    | Werkelijk resultaat                                                                                               | Geslaagd/niet geslaagd |
| ---- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Klik in tabblad A op "Rit afronden: omweg"          | Tabblad A toont € 67,00                                                                                               | Conform verwacht (`final-price.spec.ts:135`–`:136`), nadat beide tabbladen "Rit is bezig" toonden (`:128`–`:133`) | Geslaagd               |
| 2    | Noteer `completed_at`                               | Waarde genoteerd als beginstand                                                                                       | Genoteerd (`final-price.spec.ts:137`)                                                                             | Geslaagd               |
| 3    | Klik daarna in tabblad B op "Rit afronden: normaal" | Tabblad B toont € 67,00                                                                                               | Conform verwacht: kop "Rit afgerond" en € 67,00 (`final-price.spec.ts:139`–`:143`)                                | Geslaagd               |
| 4    | Controleer de database                              | `final_price_cents` = 6700; `actual_distance_m` = 21250; `actual_duration_s` = 1950; `completed_at` gelijk aan stap 2 | Conform verwacht (`final-price.spec.ts:145`–`:151`)                                                               | Geslaagd               |

### TC-19 | Verschil bij een normale rit

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-02.3 · Soort: A · Test status: **Geslaagd**

| Stap | Test stap                   | Verwacht resultaat                                        | Werkelijk resultaat                                        | Geslaagd/niet geslaagd |
| ---- | --------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| 1    | Bekijk de twee prijsblokken | Schatting € 53,80 en Eindprijs € 56,34 staan naast elkaar | Conform verwacht (scenario 3.2)                            | Geslaagd               |
| 2    | Lees de regel Verschil af   | "+ € 2,54 (+5%)"                                          | Conform verwacht: verschil "+ € 2,54 (+5%)" (scenario 3.2) | Geslaagd               |

### TC-20 | Verschil bij een omweg

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-02.3 · Soort: A · Test status: **Geslaagd**

| Stap | Test stap                                                           | Verwacht resultaat                                                            | Werkelijk resultaat             | Geslaagd/niet geslaagd |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------- | ---------------------- |
| 1    | Klik in het demoblok op "Rit afronden: omweg (simulatie chauffeur)" | "Rit afgerond" met Eindprijs € 67,00, Gereden afstand 21,3 km, Ritduur 33 min | Conform verwacht (scenario 4.1) | Geslaagd               |
| 2    | Lees de regel Verschil af                                           | "+ € 13,20 (+25%)"                                                            | Conform verwacht (scenario 4.1) | Geslaagd               |

### TC-21 | Verschil van nul

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.3
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                   | Verwacht resultaat                           | Werkelijk resultaat                                                                    | Geslaagd/niet geslaagd |
| ---- | --------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open de rit van fixture F-0 | Verschil "+ € 0,00 (+0%)"; geen waarschuwing | Conform verwacht: exacte tekst (`final-price.spec.ts:161`), geen waarschuwing (`:162`) | Geslaagd               |

### TC-22 | Klein negatief verschil

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.3
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                     | Verwacht resultaat                           | Werkelijk resultaat                                                                                                                                 | Geslaagd/niet geslaagd |
| ---- | ----------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open de rit van fixture F-NEG | Verschil "− € 0,02 (−0%)"; geen waarschuwing | Conform verwacht: exacte tekst (`final-price.spec.ts:173`), geen waarschuwing (`:174`)                                                              | Geslaagd               |
| 2    | Controleer beide mintekens    | Beide tekens zijn U+2212 (−)                 | Conform verwacht: de exacte tekstvergelijking gebruikt U+2212 op beide plekken, een koppelteken zou niet matchen (`final-price.spec.ts:172`–`:173`) | Geslaagd               |

### TC-23 | Waarschuwing bij een omweg

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-02.4 · Soort: A · Test status: **Geslaagd, stap 2 niet vastgelegd**

| Stap | Test stap                  | Verwacht resultaat                                                                                                                    | Werkelijk resultaat                                                  | Geslaagd/niet geslaagd |
| ---- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| 1    | Bekijk het eindprijsscherm | Oranje blok: "De eindprijs is meer dan 20% hoger dan de schatting. Vraag de chauffeur om uitleg, bijvoorbeeld over de gereden route." | Conform verwacht: de waarschuwing staat op het scherm (scenario 4.2) | Geslaagd               |
| 2    | Bekijk de regel Verschil   | De regel is oranje                                                                                                                    | Niet vastgelegd                                                      | Niet vastgelegd        |

### TC-24 | Geen waarschuwing bij een normale rit

Test uitgevoerd door: testpersoon O.A. · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium:
AC-02.4 · Soort: A · Test status: **Geslaagd**

| Stap | Test stap                  | Verwacht resultaat                                                                                                 | Werkelijk resultaat                                                                                                                                            | Geslaagd/niet geslaagd |
| ---- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Bekijk het eindprijsscherm | Geen waarschuwingsblok; wel de tekst "Deze prijs is berekend door HitchTracker, niet ingevoerd door de chauffeur." | Conform verwacht: geen waarschuwing; de tekst "Deze prijs is berekend door HitchTracker, niet ingevoerd door de chauffeur." staat op het scherm (scenario 3.3) | Geslaagd               |

### TC-25 | Precies 20% hoger geeft geen waarschuwing

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.4
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                    | Verwacht resultaat                             | Werkelijk resultaat                                                                           | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open de rit van fixture F-20 | Verschil "+ € 10,76 (+20%)"; geen waarschuwing | Conform verwacht: exacte tekst (`final-price.spec.ts:185`–`:187`), geen waarschuwing (`:188`) | Geslaagd               |

### TC-26 | Net boven 20% geeft wel een waarschuwing

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: AC-02.4
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                     | Verwacht resultaat                                    | Werkelijk resultaat                                                                                | Geslaagd/niet geslaagd |
| ---- | ----------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open de rit van fixture F-20+ | Verschil "+ € 10,77 (+20%)"; de waarschuwing staat er | Conform verwacht: exacte tekst (`final-price.spec.ts:199`–`:201`), waarschuwing zichtbaar (`:202`) | Geslaagd               |

### TC-27 | Rit ouder dan 30 dagen wordt verwijderd

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: OK-01
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                    | Verwacht resultaat                                   | Werkelijk resultaat                                                                   | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Voer het opschoonscript uit  | Uitvoer: "1 rit(ten) ouder dan 30 dagen verwijderd." | Conform verwacht: uitvoer van `npm run ritten:opschonen` (`cleanup.spec.ts:19`–`:21`) | Geslaagd               |
| 2    | Controleer het aantal ritten | 0                                                    | 0 (`cleanup.spec.ts:22`)                                                              | Geslaagd               |

### TC-28 | Rit van 29 dagen blijft staan

Test uitgevoerd door: Ahmad Alasmi · Test uitgevoerd op: 08-10-2026 · Acceptatiecriterium: OK-01
· Soort: I · Test status: **Geslaagd**

| Stap | Test stap                    | Verwacht resultaat                                   | Werkelijk resultaat                                                                   | Geslaagd/niet geslaagd |
| ---- | ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Voer het opschoonscript uit  | Uitvoer: "0 rit(ten) ouder dan 30 dagen verwijderd." | Conform verwacht: uitvoer van `npm run ritten:opschonen` (`cleanup.spec.ts:28`–`:30`) | Geslaagd               |
| 2    | Controleer het aantal ritten | 1                                                    | 1 (`cleanup.spec.ts:31`)                                                              | Geslaagd               |

## 3. Dekkingstabel

### 3.1 Acceptatiecriteria en ontwerpkeuze

Geslaagde TC's per criterium. Een TC met een niet vastgelegde stap telt hier alleen mee voor het
deel dat wel is vastgelegd.

| Criterium | Omschrijving (kort)                                             | Geslaagde TC's             | Opmerking                                                                                            |
| --------- | --------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| AC-01.1   | Vertrekpunt en bestemming verplicht, anders melding             | TC-01, TC-02, TC-03        | TC-01 en TC-02: melding vastgelegd, URL niet (paragraaf 5.3 punt 1). TC-03 toetst de server zelf     |
| AC-01.2   | Schatting toont reistijd in minuten en prijs in euro's          | TC-04, TC-05               | TC-04: URL niet vastgelegd (paragraaf 5.3 punt 1)                                                    |
| AC-01.3   | Prijs met het tarief van de stad; reiziger ziet welk tarief     | TC-06, TC-07               | TC-06 stap 3 (narekenen) niet vastgelegd; de berekening zelf is getoetst in TC-07                    |
| AC-01.4   | Rit en schatting alleen opgeslagen na accepteren                | TC-08, TC-09, TC-10        |                                                                                                      |
| AC-01.5   | Melding bij een stad zonder tarief                              | TC-11, TC-12               | TC-11: URL en verdwijnen van de melding niet vastgelegd (paragraaf 5.3 punt 1)                       |
| AC-02.1   | Eindprijs, gereden afstand en ritduur na afronden               | TC-13, TC-14               | TC-13: URL niet vastgelegd (paragraaf 5.3 punt 1)                                                    |
| AC-02.2   | Eindprijs door het systeem, met het tarief van de schatting     | TC-15, TC-16, TC-17, TC-18 |                                                                                                      |
| AC-02.3   | Eindprijs naast de schatting, verschil in euro's en procenten   | TC-19, TC-20, TC-21, TC-22 |                                                                                                      |
| AC-02.4   | Waarschuwing met advies bij meer dan 20% hoger                  | TC-23, TC-24, TC-25, TC-26 | TC-23: oranje regel Verschil niet vastgelegd (paragraaf 5.3 punt 1). Usability: paragraaf 5.3 punt 2 |
| OK-01     | Ritgegevens na 30 dagen verwijderd (Privacy: dataminimalisatie) | TC-27, TC-28               | Precies 30 dagen en de geplande taak niet getest (paragraaf 5.1 punt 4 en 5)                         |

### 3.2 Niet-functionele eisen

De niet-functionele eisen uit het ontwerpdocument zijn in het testplan niet genummerd. Per eis
staat hieronder hoe hij gedekt is. Er zijn geen nieuwe tests voor geschreven.

| Niet-functionele eis                                                                              | Dekking                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Er zijn geen accounts: het systeem slaat geen namen, e-mailadressen of andere persoonsgegevens op | Controle van het schema: `src/db/schema/` heeft de tabellen `cities`, `tariffs`, `locations`, `routes` en `rides`. Er is geen gebruikerstabel en geen kolom voor naam, e-mailadres of een andere persoonsgegeven. Niet met een testcase getoetst                   |
| Het systeem gebruikt vaste ophaalpunten, geen GPS-locatie van de reiziger                         | Controle van het schema: `rides` verwijst met `origin_location_id` en `destination_location_id` naar de vaste punten in `locations`; er zijn geen kolommen voor coördinaten. In TC-01, TC-02, TC-04 en TC-11 kiest de reiziger uit een lijst                       |
| Ritgegevens worden na 30 dagen verwijderd                                                         | TC-27 en TC-28 (OK-01). Precies 30 dagen en de geplande taak in productie zijn niet getest (paragraaf 5.1 punt 4 en 5)                                                                                                                                             |
| Een rit is alleen op te vragen via een link met een niet te raden id                              | TC-08 (de ritlink bevat een uuid) en TC-10 (een ongeldige of onbekende id geeft 404). Controle van het schema: `rides.id` is een `uuid` met `defaultRandom()`                                                                                                      |
| Invoer wordt op de server gecontroleerd, niet alleen in de browser                                | TC-03 en TC-12 (gemanipuleerde URL's zonder formulier), TC-17 (aangepaste formulierwaarde), TC-15 (er gaat geen bedrag, afstand of duur mee in het verzoek)                                                                                                        |
| Bedragen worden in centen opgeslagen, zodat er geen afrondingsfouten ontstaan                     | Controle van het schema: alle bedragen zijn `integer`-kolommen met `_cents` in de naam (`tariffs`, `rides`). TC-08, TC-15 en TC-18 lezen de bedragen in centen uit de database; TC-25 en TC-26 toetsen de 20%-grens op de cent                                     |
| De webapplicatie werkt in een desktopbrowser (ontworpen op 1280 × 800)                            | Testomgeving: de integratietest draait in Chromium met een venster van 1280 × 800, de acceptatietest in Chrome op een laptop met hetzelfde venster. Geen aparte testcase; andere schermformaten en browsers vallen volgens het testplan buiten scope (hoofdstuk 1) |

## 4. Gebruikte testdata

**Seed.** Beide testvormen starten vanuit de seed uit hoofdstuk 3 van het testplan: tarief
Amsterdam (tarief 1: start € 3,00, € 2,40 per km, € 0,40 per minuut), de 7 ophaalpunten
uit de seed (de tests gebruiken id 1, 2, 4, 5, 6 en 7), en Rotterdam zonder tarief.

- Integratietest: vóór elke test worden alle tabellen geleegd met `TRUNCATE ... RESTART IDENTITY`
  en wordt de seed opnieuw geladen (`resetDatabase` in `tests/integration/support/test-database.ts`).
  Door `RESTART IDENTITY` kloppen de id's uit het testplan (Centraal Station = 1). De testdatabase
  wordt bij de start van de run aangemaakt als die nog niet bestaat en gemigreerd
  (`tests/integration/support/prepare-database.ts`).
- Acceptatietest: schone start van de database volgens hoofdstuk 3 van het testplan, vóór de
  scenario's.

**Fixtures.** Alleen de integratietest gebruikt fixtures. Ze worden per test rechtstreeks in de
testdatabase gezet en horen niet bij de seed.

| Fixture          | Gebruikt in | Inhoud                                                                                           |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| F-0              | TC-21       | Afgeronde rit Centraal Station → Schiphol, tarief 1, schatting 5380 cent, eindprijs 5380 cent    |
| F-NEG            | TC-22       | Idem, eindprijs 5378 cent                                                                        |
| F-20             | TC-25       | Idem, eindprijs 6456 cent                                                                        |
| F-20+            | TC-26       | Idem, eindprijs 6457 cent                                                                        |
| Vervangen tarief | TC-16       | Tarief 1 inactief; nieuw actief tarief voor Amsterdam: start 500, per km 300, per minuut 50 cent |
| Rit van 31 dagen | TC-27       | Geaccepteerde rit Centraal Station → Schiphol met `accepted_at` = nu − 31 dagen                  |
| Rit van 29 dagen | TC-28       | Idem met `accepted_at` = nu − 29 dagen                                                           |

De fixtures F-0 t/m F-20+ krijgen als werkelijke afstand en duur 17000 m en 1500 s. Het testplan
noemt daar geen waarden voor. De tests lezen alleen het verschil en de waarschuwing af, dus dit
heeft geen invloed op het resultaat.

**Afwijkingen van hoofdstuk 3 van het testplan:** geen.

## 5. Afwijkingen en bevindingen

### 5.1 Bekende beperkingen uit hoofdstuk 7 van het testplan

| #   | Beperking (testplan H7)                                                                                           | Bevinding in deze run                                                                                                                             | Conclusie                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Bij precies 20% (TC-25) en net daarboven (TC-26) staat allebei "(+20%)", maar alleen TC-26 geeft een waarschuwing | Beide tests zijn groen. De testpersoon gaf op de vraag "Was het duidelijk waarom je wel of geen waarschuwing kreeg?" een 3 (paragraaf 5.3 punt 2) | **Geaccepteerd met onderbouwing**: het gedrag klopt met AC-02.4 (de grens wordt in hele centen berekend, het percentage is afgerond voor de weergave). **Verbetervoorstel** voor de uitleg (hoofdstuk 8, punt 1) |
| 2   | De grensgevallen van AC-02.3 en AC-02.4 zijn via het scherm niet te maken en worden met fixtures getest           | TC-21, TC-22, TC-25 en TC-26 zijn met fixtures uitgevoerd en groen. De weergave is getoetst; het ontstaan van zo'n eindprijs niet                 | **Geaccepteerd met onderbouwing**: de berekening van de eindprijs zelf is getoetst in TC-15 en TC-16                                                                                                             |
| 3   | Het afronden van een rit is een simulatie (demoknop)                                                              | Werkelijke afstand en duur kwamen in alle tests uit scenario normaal of omweg                                                                     | **Geaccepteerd met onderbouwing**: een echte koppeling met de taximeter valt buiten de afbakening                                                                                                                |
| 4   | Precies 30 dagen is niet als grensgeval getest                                                                    | Niet getest, zoals gepland. TC-27 (31 dagen) en TC-28 (29 dagen) zijn groen                                                                       | **Geaccepteerd met onderbouwing**: de uitkomst bij precies 30 dagen hangt af van het tijdstip waarop het script draait                                                                                           |
| 5   | Het opschoonscript wordt met de hand gestart; de geplande taak in productie is niet getest                        | Niet getest, zoals gepland                                                                                                                        | **Geaccepteerd risico, doorgeschoven als verbetervoorstel** (hoofdstuk 8, punt 2)                                                                                                                                |
| 6   | Iedereen met de ritlink kan de rit bekijken                                                                       | TC-08 toont een uuid in de ritlink, TC-10 toont dat een onbekende of ongeldige link 404 geeft                                                     | **Geaccepteerd met onderbouwing**: een bewuste keuze zonder accounts; de uuid maakt de link niet te raden                                                                                                        |
| 7   | De wireframes tonen `/schatting` en `/rit/`, de applicatie gebruikt `/estimate` en `/ride/`                       | Alle tests gebruiken `/estimate` en `/ride/`                                                                                                      | **Geen afwijking**: bewuste keuze voor Engelse URL's                                                                                                                                                             |

### 5.2 Bugs gevonden tijdens het testen

Geen. De integratietest is in één run 17 van 17 geslaagd en alle 11 scenario's van de
acceptatietest zijn conform verwacht. De applicatiecode (`src/` en `app/`) is sinds tag
`h2-fase2` niet gewijzigd, dus er zijn tijdens het testen geen fixes gedaan.

### 5.3 Afwijkingen tussen testplan en uitvoering

| #   | Afwijking                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Conclusie                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Niet vastgelegde stappen in de acceptatietest.** Het acceptatietestformulier heeft één regel per scenario, met het verwachte resultaat dat de reiziger ziet. Een aantal stappen uit het testplan staat daar niet in, waardoor er geen werkelijk resultaat van is: TC-01 stap 1 en de URL in stap 3; TC-02 stap 1 en de URL in stap 3; TC-04 stap 1 en de URL in stap 2; TC-06 stap 3 (narekenen); TC-11 stap 1, de URL in stap 2 en het verdwijnen van de melding in stap 3; TC-13 de URL in stap 1; TC-23 stap 2 (regel Verschil oranje). Deze stappen staan in hoofdstuk 2 als "Niet vastgelegd" en zijn niet als geslaagd geteld | **Geaccepteerd met onderbouwing**: van elk van deze zeven testcases is het deel dat het acceptatiecriterium raakt wel vastgelegd (melding, schatting, tarief, eindprijs, waarschuwing). De niet vastgelegde stappen gaan over de URL, de beginstand van het scherm, het narekenen en de kleur van een regel. Het narekenen van de prijs (TC-06 stap 3) is voor een andere route getoetst in TC-07. **Verbetervoorstel** voor het formulier (hoofdstuk 8, punt 3) |
| 2   | **Usability-vraag 6.** Op de vraag "Was het duidelijk waarom je wel of geen waarschuwing kreeg?" gaf de testpersoon een 3, met de toelichting "Ik moest even goed lezen wat de waarschuwing was." Het is de laagste score van de zeven vragen (zie de tabel hieronder). De reden voor wel of geen waarschuwing is voor de reiziger dus niet meteen duidelijk. Dit sluit aan bij paragraaf 5.1 punt 1                                                                                                                                                                                                                                  | **Verbetervoorstel** (hoofdstuk 8, punt 1). AC-02.4 is gehaald (TC-23 t/m TC-26); de bevinding gaat over de uitleg aan de reiziger, niet over de regel zelf                                                                                                                                                                                                                                                                                                      |

Antwoorden op de usability-vragen (acceptatietest, testpersoon O.A.):

| #   | Vraag                                                                             | Cijfer (1–5) | Toelichting                                                                                                       |
| --- | --------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Was meteen duidelijk wat de rit ongeveer kost en hoe lang hij duurt?              | 5            | Ja, alles stond duidelijk voor me.                                                                                |
| 2   | Begreep je welk tarief er is gebruikt?                                            | 4            | Ja, ik moest wel even goed lezen.                                                                                 |
| 3   | Was duidelijk dat de rit pas wordt opgeslagen als je de schatting accepteert?     | 4            | Ja, als je het goed leest begrijp je dat je eerst het tarief krijgt en daarna kiest of je het accepteert of niet. |
| 4   | Begreep je het verschil tussen de schatting en de eindprijs?                      | 4            | Ja, alleen had ik het niet verwacht.                                                                              |
| 5   | Was de waarschuwing duidelijk, en vond je de toon eerlijk tegenover de chauffeur? | 4            | Ja, dat was duidelijk.                                                                                            |
| 6   | Was het duidelijk waarom je wel of geen waarschuwing kreeg?                       | 3            | Ik moest even goed lezen wat de waarschuwing was.                                                                 |
| 7   | Wat zou je veranderen?                                                            | n.v.t.       | Niets.                                                                                                            |

## 6. Toetsing aan de exitcriteria (testplan hoofdstuk 8)

| Exitcriterium                                                                                                      | Oordeel                      | Bewijs                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Alle 28 testcases zijn uitgevoerd en van een werkelijk resultaat en status voorzien                                | **Grotendeels voldaan**      | Alle 28 testcases zijn uitgevoerd en hebben een status (hoofdstuk 1 en 2). Bij zeven testcases van de acceptatietest heeft een deel van de stappen geen werkelijk resultaat, omdat het formulier die stappen niet bevat (paragraaf 5.3 punt 1)                           |
| Elk van de negen acceptatiecriteria en de ontwerpkeuze OK-01 heeft minimaal één geslaagde test                     | **Voldaan**                  | Dekkingstabel paragraaf 3.1: elk criterium heeft minimaal één volledig vastgelegde, geslaagde TC                                                                                                                                                                         |
| Een testcase telt alleen als geslaagd als het werkelijke resultaat exact gelijk is aan het verwachte resultaat     | **Voldaan**                  | De integratietest vergelijkt bedragen, reistijden en verschillen als exacte tekst (`exact: true`) en databasewaarden als exacte getallen. Bij de acceptatietest is alleen "Conform verwacht" als geslaagd geteld; stappen zonder resultaat zijn niet als geslaagd geteld |
| Elke afwijking heeft een conclusie: opgelost, geaccepteerd met onderbouwing, of doorgeschoven als verbetervoorstel | **Voldaan**                  | Paragraaf 5.1 en 5.3 hebben bij elk punt een conclusie. Er waren geen bugs (paragraaf 5.2)                                                                                                                                                                               |
| De acceptatietest is uitgevoerd en de usability-vragen zijn beantwoord                                             | **Voldaan**                  | `docs/testen/acceptatietest.md`: 11 van 11 scenario's conform verwacht, 7 van 7 vragen beantwoord (paragraaf 5.3)                                                                                                                                                        |
| Het testrapport is opgeleverd                                                                                      | **Voldaan** met dit document | `docs/testen/testrapport.md`                                                                                                                                                                                                                                             |

## 7. Conclusie

De software voldoet aan de negen acceptatiecriteria uit fase 1 (AC-01.1 t/m AC-02.4) en aan de
ontwerpkeuze OK-01: elk criterium heeft minimaal één geslaagde test. De integratietest is 17 van
17 geslaagd en alle 11 scenario's van de acceptatietest zijn conform verwacht. Er zijn geen bugs
gevonden. De niet-functionele eisen zijn gedekt door testcases of door controle van het schema
(paragraaf 3.2).

De afwijkingen hebben allemaal een conclusie:

- Niet vastgelegde stappen in zeven testcases van de acceptatietest: geaccepteerd met
  onderbouwing, met een verbetervoorstel voor het formulier (paragraaf 5.3 punt 1).
- Usability-vraag 6 (3 van 5): de reden voor wel of geen waarschuwing is niet meteen duidelijk.
  Verbetervoorstel (paragraaf 5.3 punt 2).
- De bekende beperkingen uit hoofdstuk 7 van het testplan: geaccepteerd met onderbouwing, de
  geplande opschoontaak als verbetervoorstel (paragraaf 5.1).

**Eindoordeel:** de software voldoet aan de negen acceptatiecriteria en aan OK-01. Aan vijf van de
zes exitcriteria uit hoofdstuk 8 van het testplan is voldaan; het eerste is grotendeels voldaan,
omdat het acceptatietestformulier niet elke teststap bevat. De testfase is afgerond, met die
kanttekening en drie verbetervoorstellen.

## 8. Verbetervoorstellen

1. **Uitleg bij de waarschuwingsgrens op het eindprijsscherm.** De testpersoon begreep niet meteen
   waarom er wel of geen waarschuwing kwam (paragraaf 5.3 punt 2), en bij precies 20% en net
   daarboven staat allebei "(+20%)" (paragraaf 5.1 punt 1). Voorstel: op het eindprijsscherm altijd
   de regel tonen waarop de waarschuwing is gebaseerd, bijvoorbeeld "Je krijgt een waarschuwing
   als de eindprijs meer dan 20% hoger is dan de schatting." Omdat dit de schermtekst verandert,
   wordt eerst het wireframe van het eindprijsscherm aangepast.
2. **Opschonen als geplande taak.** Nu wordt `npm run ritten:opschonen` met de hand gestart
   (paragraaf 5.1 punt 5). Voorstel: in productie een geplande taak die het script dagelijks
   draait, zoals de onderbouwing in het ontwerpdocument al aangeeft.
3. **Acceptatietestformulier per teststap.** Nu heeft het formulier één regel per scenario,
   waardoor een aantal stappen uit het testplan geen werkelijk resultaat heeft (paragraaf 5.3
   punt 1). Voorstel: in een volgende versie per teststap een regel opnemen, of de stappen die de
   testpersoon niet zelf beoordeelt (zoals de URL) als integratietest uitvoeren.
