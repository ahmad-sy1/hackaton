# Testplan HitchTracker (Hackathon 2, fase 3)

Werkproces: B1-K1-W4: Test software\
Kernflow: US-01 (Ritschatting vooraf) + US-02 (Eindprijs controleren)\
Datum: 6 oktober 2026\
Status: vastgesteld vóór uitvoering van de tests

## 1. Doel en scope

Dit testplan legt vast hoe wordt aangetoond dat de gerealiseerde software voldoet aan de acceptatiecriteria uit fase 1. Volgens de Definition of Done heeft elk acceptatiecriterium een hoofdscenario en minimaal één alternatief scenario.

### In scope

- US-01: Ritschatting vooraf (5 acceptatiecriteria)
- US-02: Eindprijs controleren (4 acceptatiecriteria)
- Het integratiepunt tussen beide stories: de eindprijs wordt berekend met het tarief dat bij de geaccepteerde schatting is vastgelegd
- De ontwerpkeuze uit de onderbouwing (Privacy: dataminimalisatie): ritten worden na 30 dagen verwijderd met `npm run ritten:opschonen`

### Buiten scope

- Epic 2 (live route en prijs tijdens de rit): valt buiten de afbakening van deze hackathon
- Accounts, betalen en een chauffeursapp: vallen buiten de afbakening
- Performancetests: geen performance-eis in de casus
- Cross-browser- en mobiele tests: de app is ontworpen en wordt gedemonstreerd op een laptop (desktop, 1280 × 800)
- Een echte koppeling met de taximeter: het afronden van een rit wordt gesimuleerd met de demoknop

## 2. Testvorm en verantwoording

Dit plan gebruikt twee testvormen: een geautomatiseerde integratietest en een acceptatietest door een testpersoon. Bij elke testcase in hoofdstuk 5 staat welke vorm het is: **I** (integratietest) of **A** (acceptatietest).

**Integratietest (I).** De applicatie bestaat uit dunne lagen: een scherm roept een server action aan, die gebruikt de rekenregels in `src/server/` en praat via Drizzle met de database. Elke laag op zich doet weinig. Het risico zit in de koppeling ertussen. Komt de prijs die op het scherm staat overeen met wat er in de database is vastgelegd? Wordt de eindprijs echt berekend met het tarief van de schatting, ook als er intussen een nieuw tarief is? Dat zie je alleen als je het hele pad aflegt. De integratietest werkt daarom via de schermen en server actions zoals een browser dat doet, en kijkt vóór en na elke actie in de database.

De integratietest dekt ook wat een gewone gebruiker niet kan doen, maar een kwaadwillende wel: aangepaste URL's, een aangepaste formulierwaarde en twee keer afronden vanuit twee tabbladen. Verder dekt hij de grensgevallen die de demoknoppen niet kunnen maken (precies 20%, een verschil van 0, een klein negatief verschil). Die worden als fixture direct in de database gezet. De keuze van de testtool wordt vastgelegd bij de uitvoering (fase 3, stap 2).

**Acceptatietest (A).** De casus draait om vertrouwen: de reiziger moet de schatting en de eindprijs begrijpen en de waarschuwing serieus nemen. Of dat lukt, toon je niet aan met een geautomatiseerde test. Een testpersoon die de app niet heeft gebouwd voert daarom de taken van een reiziger uit en beantwoordt usability-vragen. Het formulier en de vragen staan in `docs/testen/acceptatietest.md`.

Ik heb bewust niet alles dubbel getest. De hoofdscenario's van wat de reiziger ziet, zijn acceptatietests; alles wat de database, gemanipuleerde invoer of grensgevallen raakt, is een integratietest. Zo toets ik elk acceptatiecriterium op het niveau waarop het risico zit.

Ik heb geen methodiek als TMap of ISTQB volledig gevolgd. De kern ervan zit er wel in: van testbasis naar testgevallen met testdata en verwacht resultaat, uitvoeren, en rapporteren met conclusies.

## 3. Testomgeving en testdata

- Lokale ontwikkelomgeving: Next.js App Router met server actions, Node 22 (zie `.nvmrc`)
- PostgreSQL 17 in een Docker-container (`hitchtracker-db`, host-poort 5433)
- Chrome op desktop, venster 1280 × 800; applicatie op `http://localhost:3000`
- Elke testronde start vanuit dezelfde toestand: een lege database met alleen de seed-data

### Schone start

De seed voegt alleen rijen toe en leegt de tabellen niet zelf. Een schone start gaat daarom altijd via een reset.

1. Eenmalig: `.env.example` kopiëren naar `.env` (de standaardwaarde werkt met `docker-compose.yml`).
2. Eenmalig: `nvm use` en `npm ci`.
3. Database leeg en opnieuw gevuld met `npm run db:reset`. Dit voert achter elkaar uit:
   - `docker compose down -v`: container stoppen en het volume met alle data wissen
   - `npm run db:up`: nieuwe container starten en wachten tot die gezond is
   - `npm run db:migrate`: tabellen aanmaken met de migraties
   - `npm run db:seed`: seed-data laden
4. Applicatie starten met `npm run dev`.

Na deze stappen staan er nul ritten in de database.

### Seed-data

Tarief Amsterdam (tarief 1, actief): starttarief € 3,00, € 2,40 per km, € 0,40 per minuut. Rotterdam heeft geen tarief.

| Ophaalpunt         | id  | Stad      |
| ------------------ | --- | --------- |
| Centraal Station   | 1   | Amsterdam |
| Schiphol           | 2   | Amsterdam |
| Vondelpark         | 4   | Amsterdam |
| Amsterdam Zuid     | 5   | Amsterdam |
| Rotterdam Centraal | 6   | Rotterdam |
| Erasmusbrug        | 7   | Rotterdam |

| Route                       | Afstand | Duur   | Prijs (cent)                      | Op het scherm |
| --------------------------- | ------- | ------ | --------------------------------- | ------------- |
| Centraal Station → Schiphol | 17000 m | 1500 s | 300 + 17 × 240 + 25 × 40 = 5380   | € 53,80       |
| Amsterdam Zuid → Schiphol   | 10500 m | 960 s  | 300 + 10,5 × 240 + 16 × 40 = 3460 | € 34,60       |
| Amsterdam Zuid → Vondelpark | 4000 m  | 660 s  | 300 + 4 × 240 + 11 × 40 = 1700    | € 17,00       |

Demoscenario's op de rit Centraal Station → Schiphol (schatting 5380 cent):

| Scenario | Afstand           | Duur            | Eindprijs (cent) | Verschil         | Waarschuwing |
| -------- | ----------------- | --------------- | ---------------- | ---------------- | ------------ |
| normaal  | 17850 m (17,9 km) | 1575 s (26 min) | 5634 (€ 56,34)   | + € 2,54 (+5%)   | nee          |
| omweg    | 21250 m (21,3 km) | 1950 s (33 min) | 6700 (€ 67,00)   | + € 13,20 (+25%) | ja           |

### Fixtures

Fixtures worden per testcase direct in de database gezet en horen niet bij de seed. De seed zelf verandert niet.

Grensgevallen: een rit Centraal Station → Schiphol met tarief 1, schatting 5380 cent, status `afgerond` en de eindprijs uit de tabel.

| Fixture | Eindprijs (cent) | Verschil op het scherm | Waarschuwing | Waarom                                 |
| ------- | ---------------- | ---------------------- | ------------ | -------------------------------------- |
| F-0     | 5380             | + € 0,00 (+0%)         | nee          | geen verschil                          |
| F-NEG   | 5378             | − € 0,02 (−0%)         | nee          | klein negatief verschil                |
| F-20    | 6456             | + € 10,76 (+20%)       | nee          | precies 20%: 645600 > 645600 is onwaar |
| F-20+   | 6457             | + € 10,77 (+20%)       | ja           | net erboven: 645700 > 645600 is waar   |

Het minteken in F-NEG is bij bedrag en percentage hetzelfde teken: U+2212 (−).

Overige fixtures:

- TC-16: een tweede tarief voor Amsterdam (start € 5,00, € 3,00 per km, € 0,50 per minuut), actief; tarief 1 inactief
- TC-27: een rit met `accepted_at` = nu − 31 dagen
- TC-28: een rit met `accepted_at` = nu − 29 dagen

### Notatie op het schattingsscherm

Het schattingsscherm toont de verwachte prijs als `± € 53,80` en de reistijd als `ca. 25 minuten · 17 km`. Volgens wireframe 2 horen "±" en "ca." bij de tekst op het scherm: ze geven de reiziger aan dat het een schatting is. Ze zijn geen marge voor de test. Een testcase slaagt alleen als de tekst exact zo op het scherm staat en de opgeslagen waarden exact kloppen.

## 4. Testscenario's

Elk scenario is in Given/When/Then geschreven, zodat het één op één herbruikbaar is als naam van een geautomatiseerde test en als taak in de acceptatietest. Eén test kan meerdere acceptatiecriteria raken; de kolom AC laat zien welke.

### Nummering van de acceptatiecriteria

De acceptatiecriteria zijn in het ontwerpdocument al genummerd. De tekst is ongewijzigd overgenomen.

US-01 - Ritschatting vooraf

| Nr      | Acceptatiecriterium                                                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01.1 | Vertrekpunt en bestemming zijn allebei verplicht. Ontbreekt er één, dan krijgt de reiziger een melding en wordt er geen schatting gemaakt.                      |
| AC-01.2 | De schatting toont de verwachte reistijd in minuten en de verwachte prijs in euro's.                                                                            |
| AC-01.3 | De prijs wordt berekend met het tarief van de stad: starttarief + prijs per km + prijs per minuut. De reiziger ziet welk tarief is gebruikt.                    |
| AC-01.4 | Accepteert de reiziger de schatting, dan wordt er een rit aangemaakt en wordt de schatting bij die rit vastgelegd. Zonder acceptatie wordt er niets opgeslagen. |
| AC-01.5 | Ligt de bestemming buiten een stad met een bekend tarief, dan krijgt de reiziger een melding dat er geen schatting mogelijk is.                                 |

US-02 - Eindprijs controleren

| Nr      | Acceptatiecriterium                                                                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-02.1 | Na het afronden van de rit ziet de reiziger de eindprijs, de gereden afstand en de ritduur.                                                                 |
| AC-02.2 | De eindprijs wordt berekend door het systeem, met hetzelfde tarief als de schatting en de werkelijke afstand en duur. De chauffeur kan geen prijs invoeren. |
| AC-02.3 | De eindprijs staat naast de vastgelegde schatting, met het verschil in euro's en procenten.                                                                 |
| AC-02.4 | Is de eindprijs meer dan 20% hoger dan de schatting, dan ziet de reiziger een duidelijke waarschuwing met het advies de chauffeur aan te spreken.           |

Daarnaast wordt één ontwerpkeuze uit de onderbouwing getest: OK-01 (ritgegevens worden na 30 dagen verwijderd, Privacy: dataminimalisatie).

Ritschatting

| #   | Scenario                                                                                                                                                              | Testdata                 | Verwacht resultaat                                                                                           | AC      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | Gegeven het startscherm, wanneer de reiziger zonder keuze een schatting opvraagt, dan krijgt de reiziger een melding en wordt er geen schatting gemaakt               | geen keuze               | Melding "Kies een vertrekpunt en een bestemming."; URL blijft `/`                                            | AC-01.1 |
| 2   | Gegeven het startscherm, wanneer de reiziger alleen een vertrekpunt kiest en een schatting opvraagt, dan krijgt de reiziger een melding                               | vertrekpunt 1            | Dezelfde melding; URL blijft `/`                                                                             | AC-01.1 |
| 3   | Gegeven een schone database, wanneer iemand `/estimate` opent met een ontbrekende, gelijke, tekstuele, negatieve of onbekende id, dan wordt er geen schatting gemaakt | zes gemanipuleerde URL's | "Geen schatting mogelijk" met de melding; geen prijs; 0 ritten                                               | AC-01.1 |
| 4   | Gegeven het startscherm, wanneer de reiziger Centraal Station → Schiphol kiest, dan ziet de reiziger de verwachte prijs en reistijd                                   | route 1 → 2              | `± € 53,80` en `ca. 25 minuten · 17 km`                                                                      | AC-01.2 |
| 5   | Gegeven een schone database, wanneer een schatting wordt opgevraagd voor Amsterdam Zuid → Schiphol, dan klopt ook een afstand met decimaal                            | route 5 → 2              | `± € 34,60` en `ca. 16 minuten · 10,5 km`                                                                    | AC-01.2 |
| 6   | Gegeven een schatting voor Centraal Station → Schiphol, wanneer de reiziger het tariefblok bekijkt, dan ziet de reiziger welk tarief is gebruikt                      | tarief 1                 | "Gebruikt tarief (Amsterdam)" met € 3,00 / € 2,40 / € 0,40; prijs = 300 + 17 × 240 + 25 × 40 cent            | AC-01.3 |
| 7   | Gegeven een schone database, wanneer een schatting wordt opgevraagd voor Amsterdam Zuid → Vondelpark, dan klopt de berekening ook voor een andere route               | route 5 → 4              | `± € 17,00` (1700 cent) en `ca. 11 minuten · 4 km`                                                           | AC-01.3 |
| 8   | Gegeven een schatting, wanneer de reiziger die accepteert, dan wordt er precies één rit met de schatting vastgelegd                                                   | route 1 → 2              | Ritscherm op `/ride/{uuid}`; 1 rit met status `geaccepteerd`, tarief 1, 17000 / 1500 / 5380                  | AC-01.4 |
| 9   | Gegeven een schatting, wanneer de reiziger op Terug klikt zonder te accepteren, dan wordt er niets opgeslagen                                                         | route 1 → 2              | Startscherm; 0 ritten                                                                                        | AC-01.4 |
| 10  | Gegeven een schone database, wanneer iemand een ritlink opent met een ongeldige of onbekende uuid, dan bestaat die rit niet                                           | `/ride/abc`, nul-uuid    | HTTP 404; geen databasefout                                                                                  | AC-01.4 |
| 11  | Gegeven het startscherm, wanneer de reiziger Rotterdam Centraal → Erasmusbrug kiest, dan krijgt de reiziger een melding dat er geen schatting mogelijk is             | route 6 → 7, geen tarief | Oranje melding "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk."; knop uitgeschakeld | AC-01.5 |
| 12  | Gegeven een schone database, wanneer iemand `/estimate?from=6&to=7` direct opent, dan wordt er geen schatting gemaakt                                                 | route 6 → 7              | "Geen schatting mogelijk" met de tariefmelding; geen accepteerknop; 0 ritten                                 | AC-01.5 |

Eindprijs

| #   | Scenario                                                                                                                                                                   | Testdata                 | Verwacht resultaat                                                                                                                                 | AC      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 13  | Gegeven een geaccepteerde rit, wanneer de chauffeur de rit afrondt met scenario normaal, dan ziet de reiziger de eindprijs, de gereden afstand en de ritduur               | scenario normaal         | "Rit afgerond"; € 56,34, 17,9 km, 26 min                                                                                                           | AC-02.1 |
| 14  | Gegeven een afgeronde rit, wanneer de reiziger de ritlink later in een nieuw tabblad opent, dan ziet de reiziger opnieuw de eindprijs                                      | ritlink                  | Zelfde eindprijsscherm; geen demoblok                                                                                                              | AC-02.1 |
| 15  | Gegeven een geaccepteerde rit, wanneer de rit wordt afgerond met scenario normaal, dan berekent het systeem de eindprijs met tarief 1 en de werkelijke afstand en duur     | scenario normaal         | Database: `afgerond`, 17850 / 1575 / 5634, `completed_at` gevuld; het verzoek bevat alleen de rit-id en het scenario, geen bedrag, afstand of duur | AC-02.2 |
| 16  | Gegeven een geaccepteerde rit en een daarna vervangen tarief, wanneer de rit wordt afgerond, dan wordt nog steeds het tarief van de schatting gebruikt                     | fixture nieuw tarief     | `final_price_cents` = 5634; `tariff_id` = 1                                                                                                        | AC-02.2 |
| 17  | Gegeven een geaccepteerde rit, wanneer het afrondformulier wordt verstuurd met een niet-bestaand scenario, dan wordt de rit niet afgerond                                  | `scenario = free`        | Rit blijft `geaccepteerd`; eindwaarden leeg; scherm "Rit is bezig"                                                                                 | AC-02.2 |
| 18  | Gegeven een geaccepteerde rit in twee tabbladen, wanneer de rit in het ene tabblad met omweg en daarna in het andere met normaal wordt afgerond, dan telt alleen de eerste | eerst omweg, dan normaal | Beide tabbladen € 67,00; database 21250 / 1950 / 6700; `completed_at` onveranderd                                                                  | AC-02.2 |
| 19  | Gegeven een met normaal afgeronde rit, wanneer de reiziger het eindprijsscherm bekijkt, dan staat de eindprijs naast de schatting met het verschil                         | scenario normaal         | € 53,80 naast € 56,34; "+ € 2,54 (+5%)"                                                                                                            | AC-02.3 |
| 20  | Gegeven een met omweg afgeronde rit, wanneer de reiziger het eindprijsscherm bekijkt, dan staat het verschil in euro's en procenten                                        | scenario omweg           | € 67,00, 21,3 km, 33 min; "+ € 13,20 (+25%)"                                                                                                       | AC-02.3 |
| 21  | Gegeven een afgeronde rit zonder verschil, wanneer de reiziger het eindprijsscherm bekijkt, dan is het verschil nul met een plusteken                                      | F-0                      | "+ € 0,00 (+0%)"; geen waarschuwing                                                                                                                | AC-02.3 |
| 22  | Gegeven een afgeronde rit die 2 cent goedkoper is, wanneer de reiziger het eindprijsscherm bekijkt, dan tonen bedrag en percentage hetzelfde minteken                      | F-NEG                    | "− € 0,02 (−0%)", beide U+2212; geen waarschuwing                                                                                                  | AC-02.3 |
| 23  | Gegeven een met omweg afgeronde rit, wanneer de reiziger het eindprijsscherm bekijkt, dan ziet de reiziger een waarschuwing met advies                                     | scenario omweg (+25%)    | Oranje waarschuwing met advies; regel Verschil oranje                                                                                              | AC-02.4 |
| 24  | Gegeven een met normaal afgeronde rit, wanneer de reiziger het eindprijsscherm bekijkt, dan staat er geen waarschuwing                                                     | scenario normaal (+5%)   | Geen waarschuwing; wel "Deze prijs is berekend door HitchTracker…"                                                                                 | AC-02.4 |
| 25  | Gegeven een afgeronde rit die precies 20% duurder is, wanneer de reiziger het eindprijsscherm bekijkt, dan staat er geen waarschuwing                                      | F-20                     | "+ € 10,76 (+20%)"; geen waarschuwing                                                                                                              | AC-02.4 |
| 26  | Gegeven een afgeronde rit die 1 cent boven de 20% zit, wanneer de reiziger het eindprijsscherm bekijkt, dan staat de waarschuwing er wel                                   | F-20+                    | "+ € 10,77 (+20%)"; waarschuwing zichtbaar                                                                                                         | AC-02.4 |

Opschonen

| #   | Scenario                                                                                                             | Testdata                  | Verwacht resultaat                                            | AC    |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------- | ----- |
| 27  | Gegeven een rit die 31 dagen geleden is geaccepteerd, wanneer het opschoonscript draait, dan wordt de rit verwijderd | `accepted_at` = nu − 31 d | "1 rit(ten) ouder dan 30 dagen verwijderd."; rit weg          | OK-01 |
| 28  | Gegeven een rit die 29 dagen geleden is geaccepteerd, wanneer het opschoonscript draait, dan blijft de rit staan     | `accepted_at` = nu − 29 d | "0 rit(ten) ouder dan 30 dagen verwijderd."; rit staat er nog | OK-01 |

## 5. Testcases

De scenario's uit hoofdstuk 4 zijn hieronder uitgewerkt tot uitvoerbare testcases. Elke case heeft een preconditie, genummerde stappen en een verwacht resultaat. De kolommen Werkelijk resultaat en Status blijven leeg tot de uitvoering en worden ingevuld in het testrapport. Testcases van het type A worden uitgevoerd door de testpersoon met het formulier in `docs/testen/acceptatietest.md`.

Voor alle cases geldt dezelfde algemene preconditie: de applicatie draait lokaal en de database is leeg en opnieuw gevuld met de seed (schone start, hoofdstuk 3).

### TC-01 | Leeg formulier geeft een melding

| Test case ID: TC-01                                                                                                | Prioriteit: Hoog                                   |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Pre-condition: Het startscherm is geopend; er is niets gekozen.                                                    | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Leeg formulier geeft een melding                                                                  | Test uitgevoerd op: -                              |
| Test case description: Controle of een schatting zonder vertrekpunt en bestemming wordt geweigerd met een melding. | Test status: -                                     |
| Acceptatiecriterium: AC-01.1                                                                                       | Soort: A (acceptatietest)                          |

| Stap # | Test stap                                          | Verwacht resultaat                                                                         | Test data                   | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------- | ------------------- | ------------------------ |
| 1      | Ga naar het startscherm                            | Kop "Waar wil je naartoe?" met twee keuzevelden en de knop "Schatting opvragen"            | URL: http://localhost:3000/ |                     |                          |
| 2      | Klik op "Schatting opvragen" zonder iets te kiezen | Melding "Kies een vertrekpunt en een bestemming."; beide keuzevelden krijgen een rode rand | geen keuze                  |                     |                          |
| 3      | Controleer de URL                                  | De URL is nog steeds `/`; er verschijnt geen schatting                                     | n.v.t.                      |                     |                          |

### TC-02 | Alleen een vertrekpunt geeft een melding

| Test case ID: TC-02                                                                                      | Prioriteit: Midden                                 |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: Het startscherm is geopend.                                                               | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Alleen een vertrekpunt geeft een melding                                                | Test uitgevoerd op: -                              |
| Test case description: Controle of een schatting zonder bestemming wordt geweigerd met dezelfde melding. | Test status: -                                     |
| Acceptatiecriterium: AC-01.1                                                                             | Soort: A (acceptatietest)                          |

| Stap # | Test stap                    | Verwacht resultaat                                                       | Test data                      | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | ------------------------------------------------------------------------ | ------------------------------ | ------------------- | ------------------------ |
| 1      | Kies alleen een vertrekpunt  | Het vertrekpunt is gekozen; de bestemming staat op "Kies een bestemming" | vertrekpunt = Centraal Station |                     |                          |
| 2      | Klik op "Schatting opvragen" | Melding "Kies een vertrekpunt en een bestemming."                        | n.v.t.                         |                     |                          |
| 3      | Controleer de URL            | De URL is nog steeds `/`; er verschijnt geen schatting                   | n.v.t.                         |                     |                          |

### TC-03 | Gemanipuleerde URL's geven geen schatting

| Test case ID: TC-03                                                                                                                                      | Prioriteit: Hoog                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start; 0 ritten in de database.                                                                                                    | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Gemanipuleerde URL's geven geen schatting                                                                                               | Test uitgevoerd op: -              |
| Test case description: Controle of de server zelf de invoer controleert, ook als het formulier wordt overgeslagen en de URL met de hand wordt aangepast. | Test status: -                     |
| Acceptatiecriterium: AC-01.1                                                                                                                             | Soort: I (integratietest)          |

| Stap # | Test stap                        | Verwacht resultaat                                                                                                                                       | Test data                                                                                                                                       | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open elk van de zes URL's direct | Elke URL toont de kop "Geen schatting mogelijk", de melding "Kies een vertrekpunt en een bestemming." en de knop "Terug naar start"; er staat geen prijs | URL's: `/estimate`, `/estimate?from=1`, `/estimate?from=1&to=1`, `/estimate?from=abc&to=2`, `/estimate?from=-1&to=2`, `/estimate?from=1&to=999` |                     |                          |
| 2      | Controleer het aantal ritten     | 0                                                                                                                                                        | SQL: SELECT COUNT(*) FROM rides;                                                                                                                |                     |                          |

### TC-04 | Schatting Centraal Station → Schiphol

| Test case ID: TC-04                                                                                                     | Prioriteit: Hoog                                   |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: Het startscherm is geopend.                                                                              | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Schatting Centraal Station → Schiphol                                                                  | Test uitgevoerd op: -                              |
| Test case description: Controle of de schatting de verwachte reistijd in minuten en de verwachte prijs in euro's toont. | Test status: -                                     |
| Acceptatiecriterium: AC-01.2                                                                                            | Soort: A (acceptatietest)                          |

| Stap # | Test stap                              | Verwacht resultaat                                                   | Test data                                             | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Kies vertrekpunt en bestemming         | Beide keuzes staan in de velden                                      | vertrekpunt = Centraal Station, bestemming = Schiphol |                     |                          |
| 2      | Klik op "Schatting opvragen"           | De URL is `/estimate?from=1&to=2`; kop "Centraal Station → Schiphol" | n.v.t.                                                |                     |                          |
| 3      | Lees de verwachte prijs en reistijd af | Prijs `± € 53,80`; daaronder `ca. 25 minuten · 17 km`                | route 1 → 2 (17000 m, 1500 s)                         |                     |                          |

### TC-05 | Schatting met een afstand met decimaal

| Test case ID: TC-05                                                                                           | Prioriteit: Midden                 |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start.                                                                                  | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Schatting met een afstand met decimaal                                                       | Test uitgevoerd op: -              |
| Test case description: Controle of prijs, reistijd en een afstand met decimaal kloppen voor een tweede route. | Test status: -                     |
| Acceptatiecriterium: AC-01.2                                                                                  | Soort: I (integratietest)          |

| Stap # | Test stap                    | Verwacht resultaat                                      | Test data                                       | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | ------------------------------------------------------- | ----------------------------------------------- | ------------------- | ------------------------ |
| 1      | Vraag een schatting op       | Prijs `± € 34,60`; daaronder `ca. 16 minuten · 10,5 km` | URL: http://localhost:3000/estimate?from=5&to=2 |                     |                          |
| 2      | Controleer het aantal ritten | 0                                                       | SQL: SELECT COUNT(*) FROM rides;                |                     |                          |

### TC-06 | Gebruikt tarief is zichtbaar

| Test case ID: TC-06                                                                                                    | Prioriteit: Hoog                                   |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: De schatting Centraal Station → Schiphol staat op het scherm (na TC-04).                                | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Gebruikt tarief is zichtbaar                                                                          | Test uitgevoerd op: -                              |
| Test case description: Controle of de reiziger ziet welk tarief is gebruikt en of de prijs met dat tarief is berekend. | Test status: -                                     |
| Acceptatiecriterium: AC-01.3                                                                                           | Soort: A (acceptatietest)                          |

| Stap # | Test stap                             | Verwacht resultaat                                                                         | Test data     | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------ | ------------- | ------------------- | ------------------------ |
| 1      | Bekijk het blok rechts naast de prijs | Kop "Gebruikt tarief (Amsterdam)" met Starttarief € 3,00, Per km € 2,40, Per minuut € 0,40 | tarief 1      |                     |                          |
| 2      | Lees de tekst onder het blok          | "De eindprijs wordt met dit tarief berekend."                                              | n.v.t.        |                     |                          |
| 3      | Reken de prijs na                     | 300 + 17 × 240 + 25 × 40 = 5380 cent = € 53,80, gelijk aan de getoonde prijs               | 17 km, 25 min |                     |                          |

### TC-07 | Berekening voor een tweede route

| Test case ID: TC-07                                                                                      | Prioriteit: Midden                 |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start.                                                                             | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Berekening voor een tweede route                                                        | Test uitgevoerd op: -              |
| Test case description: Controle of de tariefberekening ook klopt voor een andere route binnen Amsterdam. | Test status: -                     |
| Acceptatiecriterium: AC-01.3                                                                             | Soort: I (integratietest)          |

| Stap # | Test stap              | Verwacht resultaat                                                                                                        | Test data                                       | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------- | ------------------------ |
| 1      | Vraag een schatting op | Prijs `± € 17,00` (300 + 4 × 240 + 11 × 40 = 1700 cent); daaronder `ca. 11 minuten · 4 km`; "Gebruikt tarief (Amsterdam)" | URL: http://localhost:3000/estimate?from=5&to=4 |                     |                          |

### TC-08 | Accepteren legt precies één rit vast

| Test case ID: TC-08                                                                                                                                | Prioriteit: Hoog                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start; 0 ritten in de database.                                                                                              | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Accepteren legt precies één rit vast                                                                                              | Test uitgevoerd op: -              |
| Test case description: Controle of accepteren een rit aanmaakt met de schatting en het tarief, en of de reiziger een niet te raden ritlink krijgt. | Test status: -                     |
| Acceptatiecriterium: AC-01.4                                                                                                                       | Soort: I (integratietest)          |

| Stap # | Test stap                      | Verwacht resultaat                                                                                                                                                      | Test data                                                                                                                           | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de schatting              | Schattingsscherm met `± € 53,80`                                                                                                                                        | URL: http://localhost:3000/estimate?from=1&to=2                                                                                     |                     |                          |
| 2      | Klik op "Schatting accepteren" | De URL is `/ride/{uuid}`; het scherm toont "Rit is bezig" en "Vastgelegde schatting € 53,80"                                                                            | n.v.t.                                                                                                                              |                     |                          |
| 3      | Controleer de database         | Precies 1 rit met de uuid uit de URL: status `geaccepteerd`, `tariff_id` = 1, 17000 / 1500 / 5380; `actual_distance_m`, `actual_duration_s` en `final_price_cents` leeg | SQL: SELECT id, status, tariff_id, estimated_distance_m, estimated_duration_s, estimated_price_cents, final_price_cents FROM rides; |                     |                          |

### TC-09 | Niet accepteren slaat niets op

| Test case ID: TC-09                                                                                   | Prioriteit: Hoog                   |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start; 0 ritten in de database.                                                 | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Niet accepteren slaat niets op                                                       | Test uitgevoerd op: -              |
| Test case description: Controle of het bekijken van een schatting zonder te accepteren niets opslaat. | Test status: -                     |
| Acceptatiecriterium: AC-01.4                                                                          | Soort: I (integratietest)          |

| Stap # | Test stap                    | Verwacht resultaat               | Test data                                       | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | -------------------------------- | ----------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de schatting            | Schattingsscherm met `± € 53,80` | URL: http://localhost:3000/estimate?from=1&to=2 |                     |                          |
| 2      | Klik op "Terug"              | Het startscherm `/` staat open   | n.v.t.                                          |                     |                          |
| 3      | Controleer het aantal ritten | 0                                | SQL: SELECT COUNT(*) FROM rides;                |                     |                          |

### TC-10 | Ongeldige of onbekende ritlink geeft 404

| Test case ID: TC-10                                                                                                    | Prioriteit: Midden                 |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start.                                                                                           | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Ongeldige of onbekende ritlink geeft 404                                                              | Test uitgevoerd op: -              |
| Test case description: Controle of een niet-bestaande rit netjes als niet gevonden wordt getoond, zonder databasefout. | Test status: -                     |
| Acceptatiecriterium: AC-01.4                                                                                           | Soort: I (integratietest)          |

| Stap # | Test stap               | Verwacht resultaat                                           | Test data                                                            | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open een ongeldige uuid | HTTP-status 404 met de tekst "This page could not be found." | URL: http://localhost:3000/ride/abc                                  |                     |                          |
| 2      | Open een onbekende uuid | HTTP-status 404 met de tekst "This page could not be found." | URL: http://localhost:3000/ride/00000000-0000-0000-0000-000000000000 |                     |                          |
| 3      | Controleer de serverlog | Geen databasefout                                            | n.v.t.                                                               |                     |                          |

### TC-11 | Rotterdam geeft een melding dat er geen schatting mogelijk is

| Test case ID: TC-11                                                                                                        | Prioriteit: Hoog                                   |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: Het startscherm is geopend.                                                                                 | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Rotterdam geeft een melding dat er geen schatting mogelijk is                                             | Test uitgevoerd op: -                              |
| Test case description: Controle of een rit in een stad zonder tarief geen schatting oplevert, maar een duidelijke melding. | Test status: -                                     |
| Acceptatiecriterium: AC-01.5                                                                                               | Soort: A (acceptatietest)                          |

| Stap # | Test stap                      | Verwacht resultaat                                                                                                                                                  | Test data                                                  | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Kies vertrekpunt en bestemming | Beide keuzes staan in de velden                                                                                                                                     | vertrekpunt = Rotterdam Centraal, bestemming = Erasmusbrug |                     |                          |
| 2      | Klik op "Schatting opvragen"   | De URL blijft `/`; oranje melding "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk."; de knop "Schatting opvragen" is grijs en niet klikbaar | route 6 → 7, geen tarief                                   |                     |                          |
| 3      | Kies een ander vertrekpunt     | De melding verdwijnt en de knop is weer blauw en klikbaar                                                                                                           | vertrekpunt = Centraal Station                             |                     |                          |

### TC-12 | Rotterdam via de URL geeft geen schatting

| Test case ID: TC-12                                                                                                             | Prioriteit: Midden                 |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start; 0 ritten in de database.                                                                           | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Rotterdam via de URL geeft geen schatting                                                                      | Test uitgevoerd op: -              |
| Test case description: Controle of de server ook zonder het formulier weigert een schatting te maken in een stad zonder tarief. | Test status: -                     |
| Acceptatiecriterium: AC-01.5                                                                                                    | Soort: I (integratietest)          |

| Stap # | Test stap                    | Verwacht resultaat                                                                                                                                       | Test data                                       | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de URL direct           | Kop "Geen schatting mogelijk" met de melding "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk."; geen knop "Schatting accepteren" | URL: http://localhost:3000/estimate?from=6&to=7 |                     |                          |
| 2      | Controleer het aantal ritten | 0                                                                                                                                                        | SQL: SELECT COUNT(*) FROM rides;                |                     |                          |

### TC-13 | Afronden toont eindprijs, afstand en ritduur

| Test case ID: TC-13                                                                                                 | Prioriteit: Hoog                                   |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: Een geaccepteerde rit Centraal Station → Schiphol staat open op `/ride/{uuid}` ("Rit is bezig").     | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Afronden toont eindprijs, afstand en ritduur                                                       | Test uitgevoerd op: -                              |
| Test case description: Controle of de reiziger na het afronden de eindprijs, de gereden afstand en de ritduur ziet. | Test status: -                                     |
| Acceptatiecriterium: AC-02.1                                                                                        | Soort: A (acceptatietest)                          |

| Stap # | Test stap                                                             | Verwacht resultaat                                         | Test data        | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------- | ------------------- | ------------------------ |
| 1      | Klik in het demoblok op "Rit afronden: normaal (simulatie chauffeur)" | Dezelfde URL toont "Rit afgerond"                          | scenario normaal |                     |                          |
| 2      | Lees eindprijs, afstand en ritduur af                                 | Eindprijs € 56,34; Gereden afstand 17,9 km; Ritduur 26 min | n.v.t.           |                     |                          |

### TC-14 | Ritlink later opnieuw openen

| Test case ID: TC-14                                                                                | Prioriteit: Midden                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: De rit is afgerond (na TC-13); de ritlink is eerder gekopieerd met "Kopiëren".      | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Ritlink later opnieuw openen                                                      | Test uitgevoerd op: -                              |
| Test case description: Controle of de reiziger de eindprijs later via de bewaarde link terugvindt. | Test status: -                                     |
| Acceptatiecriterium: AC-02.1                                                                       | Soort: A (acceptatietest)                          |

| Stap # | Test stap                                     | Verwacht resultaat                                                         | Test data  | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------------------------- | -------------------------------------------------------------------------- | ---------- | ------------------- | ------------------------ |
| 1      | Sluit het tabblad                             | Het tabblad is dicht                                                       | n.v.t.     |                     |                          |
| 2      | Open de gekopieerde link in een nieuw tabblad | "Rit afgerond" met dezelfde waarden als in TC-13; er is geen demoblok meer | de ritlink |                     |                          |

### TC-15 | Eindprijs wordt door het systeem berekend

| Test case ID: TC-15                                                                                                                                          | Prioriteit: Hoog                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Pre-condition: Een geaccepteerde rit Centraal Station → Schiphol (zoals na TC-08).                                                                           | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Eindprijs wordt door het systeem berekend                                                                                                   | Test uitgevoerd op: -              |
| Test case description: Controle of de server de eindprijs berekent met het tarief van de rit en de werkelijke afstand en duur, zonder bedrag uit de browser. | Test status: -                     |
| Acceptatiecriterium: AC-02.2                                                                                                                                 | Soort: I (integratietest)          |

| Stap # | Test stap                           | Verwacht resultaat                                                                                                                                                                                                                                                                                         | Test data                                                                                                                 | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Rond de rit af met scenario normaal | Het verzoek is een POST naar de server action. Van de eigen velden komen alleen de rit-id (gebonden argument van de action) en het veld `scenario` met waarde `normal` uit de browser; er zit geen bedrag, afstand of duur in. De overige onderdelen (zoals de header `next-action`) zijn van Next.js zelf | scenario normaal; Next.js 16 stuurt dit als `0` = `["{uuid}","$K1"]` en `_1_scenario` = `normal`                          |                     |                          |
| 2      | Controleer de database              | Status `afgerond`; `actual_distance_m` = 17850; `actual_duration_s` = 1575; `final_price_cents` = 5634; `completed_at` gevuld                                                                                                                                                                              | SQL: SELECT status, actual_distance_m, actual_duration_s, final_price_cents, completed_at FROM rides WHERE id = '{uuid}'; |                     |                          |
| 3      | Reken de eindprijs na               | 300 + 17,85 × 240 + 26,25 × 40 = 5634 cent                                                                                                                                                                                                                                                                 | tarief 1                                                                                                                  |                     |                          |

### TC-16 | Vervangen tarief verandert de eindprijs niet

| Test case ID: TC-16                                                                                                                               | Prioriteit: Hoog                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Een geaccepteerde rit Centraal Station → Schiphol met `tariff_id` = 1.                                                             | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Vervangen tarief verandert de eindprijs niet                                                                                     | Test uitgevoerd op: -              |
| Test case description: Controle of de eindprijs met hetzelfde tarief als de schatting wordt berekend, ook als er intussen een nieuw tarief geldt. | Test status: -                     |
| Acceptatiecriterium: AC-02.2                                                                                                                      | Soort: I (integratietest)          |

| Stap # | Test stap                                                    | Verwacht resultaat                                    | Test data                                                                | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------ | ------------------- | ------------------------ |
| 1      | Zet tarief 1 op inactief en voeg een nieuw actief tarief toe | Tarief 1 inactief; nieuw tarief actief voor Amsterdam | fixture: start 500, per km 300, per minuut 50 cent                       |                     |                          |
| 2      | Rond de rit af met scenario normaal                          | Eindprijsscherm met € 56,34                           | scenario normaal                                                         |                     |                          |
| 3      | Controleer de database                                       | `final_price_cents` = 5634; `tariff_id` = 1           | SQL: SELECT tariff_id, final_price_cents FROM rides WHERE id = '{uuid}'; |                     |                          |

### TC-17 | Gemanipuleerd scenario wordt geweigerd

| Test case ID: TC-17                                                                                                               | Prioriteit: Hoog                   |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Een geaccepteerde rit staat open op `/ride/{uuid}` ("Rit is bezig").                                               | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Gemanipuleerd scenario wordt geweigerd                                                                           | Test uitgevoerd op: -              |
| Test case description: Controle of de server alleen de toegestane scenario's accepteert, ook als de formulierwaarde is aangepast. | Test status: -                     |
| Acceptatiecriterium: AC-02.2                                                                                                      | Soort: I (integratietest)          |

| Stap # | Test stap                                                         | Verwacht resultaat                                                                          | Test data                                                                                                   | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Pas de waarde van de knop "normaal" aan en verstuur het formulier | Het verzoek bereikt de server; het scherm toont nog "Rit is bezig"                          | `scenario = free`                                                                                           |                     |                          |
| 2      | Controleer de database                                            | Status `geaccepteerd`; `actual_distance_m`, `actual_duration_s` en `final_price_cents` leeg | SQL: SELECT status, actual_distance_m, actual_duration_s, final_price_cents FROM rides WHERE id = '{uuid}'; |                     |                          |

### TC-18 | Dubbel afronden vanuit twee tabbladen verandert niets

| Test case ID: TC-18                                                                                                             | Prioriteit: Midden                 |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Een geaccepteerde rit staat open in tabblad A en tabblad B (beide "Rit is bezig").                               | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Dubbel afronden vanuit twee tabbladen verandert niets                                                          | Test uitgevoerd op: -              |
| Test case description: Controle of een rit maar één keer kan worden afgerond en een tweede klik de eindprijs niet overschrijft. | Test status: -                     |
| Acceptatiecriterium: AC-02.2                                                                                                    | Soort: I (integratietest)          |

| Stap # | Test stap                                           | Verwacht resultaat                                                                                                    | Test data                                                                                                         | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Klik in tabblad A op "Rit afronden: omweg"          | Tabblad A toont € 67,00                                                                                               | scenario omweg                                                                                                    |                     |                          |
| 2      | Noteer `completed_at`                               | Waarde genoteerd als beginstand                                                                                       | SQL: SELECT completed_at FROM rides WHERE id = '{uuid}';                                                          |                     |                          |
| 3      | Klik daarna in tabblad B op "Rit afronden: normaal" | Tabblad B toont € 67,00                                                                                               | scenario normaal                                                                                                  |                     |                          |
| 4      | Controleer de database                              | `final_price_cents` = 6700; `actual_distance_m` = 21250; `actual_duration_s` = 1950; `completed_at` gelijk aan stap 2 | SQL: SELECT actual_distance_m, actual_duration_s, final_price_cents, completed_at FROM rides WHERE id = '{uuid}'; |                     |                          |

### TC-19 | Verschil bij een normale rit

| Test case ID: TC-19                                                                                                | Prioriteit: Hoog                                   |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Pre-condition: De rit is afgerond met scenario normaal (na TC-13).                                                 | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Verschil bij een normale rit                                                                      | Test uitgevoerd op: -                              |
| Test case description: Controle of de eindprijs naast de schatting staat, met het verschil in euro's en procenten. | Test status: -                                     |
| Acceptatiecriterium: AC-02.3                                                                                       | Soort: A (acceptatietest)                          |

| Stap # | Test stap                   | Verwacht resultaat                                        | Test data        | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------- | --------------------------------------------------------- | ---------------- | ------------------- | ------------------------ |
| 1      | Bekijk de twee prijsblokken | Schatting € 53,80 en Eindprijs € 56,34 staan naast elkaar | scenario normaal |                     |                          |
| 2      | Lees de regel Verschil af   | "+ € 2,54 (+5%)"                                          | n.v.t.           |                     |                          |

### TC-20 | Verschil bij een omweg

| Test case ID: TC-20                                                                                  | Prioriteit: Midden                                 |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: Een nieuwe geaccepteerde rit Centraal Station → Schiphol staat open ("Rit is bezig"). | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Verschil bij een omweg                                                              | Test uitgevoerd op: -                              |
| Test case description: Controle van de eindprijs en het verschil bij een duidelijk duurdere rit.     | Test status: -                                     |
| Acceptatiecriterium: AC-02.3                                                                         | Soort: A (acceptatietest)                          |

| Stap # | Test stap                                                           | Verwacht resultaat                                                            | Test data      | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------- | ------------------- | ------------------------ |
| 1      | Klik in het demoblok op "Rit afronden: omweg (simulatie chauffeur)" | "Rit afgerond" met Eindprijs € 67,00, Gereden afstand 21,3 km, Ritduur 33 min | scenario omweg |                     |                          |
| 2      | Lees de regel Verschil af                                           | "+ € 13,20 (+25%)"                                                            | n.v.t.         |                     |                          |

### TC-21 | Verschil van nul

| Test case ID: TC-21                                                                                  | Prioriteit: Laag                   |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Fixture F-0 staat in de database.                                                     | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Verschil van nul                                                                    | Test uitgevoerd op: -              |
| Test case description: Controle van de weergave als de eindprijs precies gelijk is aan de schatting. | Test status: -                     |
| Acceptatiecriterium: AC-02.3                                                                         | Soort: I (integratietest)          |

| Stap # | Test stap                   | Verwacht resultaat                           | Test data                                                           | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------- | -------------------------------------------- | ------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de rit van fixture F-0 | Verschil "+ € 0,00 (+0%)"; geen waarschuwing | URL: http://localhost:3000/ride/{uuid van F-0}; eindprijs 5380 cent |                     |                          |

### TC-22 | Klein negatief verschil

| Test case ID: TC-22                                                                                               | Prioriteit: Laag                   |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Fixture F-NEG staat in de database.                                                                | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Klein negatief verschil                                                                          | Test uitgevoerd op: -              |
| Test case description: Controle of bedrag en percentage bij een klein negatief verschil hetzelfde minteken tonen. | Test status: -                     |
| Acceptatiecriterium: AC-02.3                                                                                      | Soort: I (integratietest)          |

| Stap # | Test stap                     | Verwacht resultaat                           | Test data                                                             | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------------- | -------------------------------------------- | --------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de rit van fixture F-NEG | Verschil "− € 0,02 (−0%)"; geen waarschuwing | URL: http://localhost:3000/ride/{uuid van F-NEG}; eindprijs 5378 cent |                     |                          |
| 2      | Controleer beide mintekens    | Beide tekens zijn U+2212 (−)                 | n.v.t.                                                                |                     |                          |

### TC-23 | Waarschuwing bij een omweg

| Test case ID: TC-23                                                                                                   | Prioriteit: Hoog                                   |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Pre-condition: De rit is afgerond met scenario omweg (na TC-20).                                                      | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Waarschuwing bij een omweg                                                                           | Test uitgevoerd op: -                              |
| Test case description: Controle of de reiziger bij meer dan 20% verschil een duidelijke waarschuwing met advies ziet. | Test status: -                                     |
| Acceptatiecriterium: AC-02.4                                                                                          | Soort: A (acceptatietest)                          |

| Stap # | Test stap                  | Verwacht resultaat                                                                                                                    | Test data             | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------- | ------------------------ |
| 1      | Bekijk het eindprijsscherm | Oranje blok: "De eindprijs is meer dan 20% hoger dan de schatting. Vraag de chauffeur om uitleg, bijvoorbeeld over de gereden route." | scenario omweg (+25%) |                     |                          |
| 2      | Bekijk de regel Verschil   | De regel is oranje                                                                                                                    | n.v.t.                |                     |                          |

### TC-24 | Geen waarschuwing bij een normale rit

| Test case ID: TC-24                                                                        | Prioriteit: Hoog                                   |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Pre-condition: De rit is afgerond met scenario normaal (na TC-13).                         | Test uitgevoerd door: Testpersoon (acceptatietest) |
| Test case title: Geen waarschuwing bij een normale rit                                     | Test uitgevoerd op: -                              |
| Test case description: Controle of er onder de grens van 20% geen waarschuwing verschijnt. | Test status: -                                     |
| Acceptatiecriterium: AC-02.4                                                               | Soort: A (acceptatietest)                          |

| Stap # | Test stap                  | Verwacht resultaat                                                                                                 | Test data              | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------- | ------------------------ |
| 1      | Bekijk het eindprijsscherm | Geen waarschuwingsblok; wel de tekst "Deze prijs is berekend door HitchTracker, niet ingevoerd door de chauffeur." | scenario normaal (+5%) |                     |                          |

### TC-25 | Precies 20% hoger geeft geen waarschuwing

| Test case ID: TC-25                                                                                | Prioriteit: Hoog                   |
| -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Fixture F-20 staat in de database.                                                  | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Precies 20% hoger geeft geen waarschuwing                                         | Test uitgevoerd op: -              |
| Test case description: Controle van de ondergrens van AC-02.4: precies 20% is niet _meer dan_ 20%. | Test status: -                     |
| Acceptatiecriterium: AC-02.4                                                                       | Soort: I (integratietest)          |

| Stap # | Test stap                    | Verwacht resultaat                             | Test data                                                                                 | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de rit van fixture F-20 | Verschil "+ € 10,76 (+20%)"; geen waarschuwing | URL: http://localhost:3000/ride/{uuid van F-20}; 6456 × 100 = 645600, 5380 × 120 = 645600 |                     |                          |

### TC-26 | Net boven 20% geeft wel een waarschuwing

| Test case ID: TC-26                                                                                 | Prioriteit: Hoog                   |
| --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Fixture F-20+ staat in de database.                                                  | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Net boven 20% geeft wel een waarschuwing                                           | Test uitgevoerd op: -              |
| Test case description: Controle dat 1 cent boven de grens van 20% de waarschuwing laat verschijnen. | Test status: -                     |
| Acceptatiecriterium: AC-02.4                                                                        | Soort: I (integratietest)          |

| Stap # | Test stap                     | Verwacht resultaat                                    | Test data                                                         | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open de rit van fixture F-20+ | Verschil "+ € 10,77 (+20%)"; de waarschuwing staat er | URL: http://localhost:3000/ride/{uuid van F-20+}; 645700 > 645600 |                     |                          |

### TC-27 | Rit ouder dan 30 dagen wordt verwijderd

| Test case ID: TC-27                                                                                                   | Prioriteit: Midden                 |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start; één rit Centraal Station → Schiphol met `accepted_at` = nu − 31 dagen.                   | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Rit ouder dan 30 dagen wordt verwijderd                                                              | Test uitgevoerd op: -              |
| Test case description: Controle of het opschoonscript ritgegevens ouder dan de bewaartermijn van 30 dagen verwijdert. | Test status: -                     |
| Acceptatiecriterium: OK-01                                                                                            | Soort: I (integratietest)          |

| Stap # | Test stap                    | Verwacht resultaat                                   | Test data                        | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | ---------------------------------------------------- | -------------------------------- | ------------------- | ------------------------ |
| 1      | Voer het opschoonscript uit  | Uitvoer: "1 rit(ten) ouder dan 30 dagen verwijderd." | `npm run ritten:opschonen`       |                     |                          |
| 2      | Controleer het aantal ritten | 0                                                    | SQL: SELECT COUNT(*) FROM rides; |                     |                          |

### TC-28 | Rit van 29 dagen blijft staan

| Test case ID: TC-28                                                                                  | Prioriteit: Midden                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Schone start; één rit Centraal Station → Schiphol met `accepted_at` = nu − 29 dagen.  | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Rit van 29 dagen blijft staan                                                       | Test uitgevoerd op: -              |
| Test case description: Controle of het opschoonscript ritten binnen de bewaartermijn ongemoeid laat. | Test status: -                     |
| Acceptatiecriterium: OK-01                                                                           | Soort: I (integratietest)          |

| Stap # | Test stap                    | Verwacht resultaat                                   | Test data                        | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------- | ---------------------------------------------------- | -------------------------------- | ------------------- | ------------------------ |
| 1      | Voer het opschoonscript uit  | Uitvoer: "0 rit(ten) ouder dan 30 dagen verwijderd." | `npm run ritten:opschonen`       |                     |                          |
| 2      | Controleer het aantal ritten | 1                                                    | SQL: SELECT COUNT(*) FROM rides; |                     |                          |

## 6. Dekking en risicoverdeling

Elk van de negen acceptatiecriteria wordt door minimaal één test geraakt, en van elk criterium wordt zowel het hoofdpad als minimaal één alternatief pad getest. De ontwerpkeuze OK-01 wordt aan beide kanten van de bewaartermijn getest.

| Risicotype                           | Tests                  |
| ------------------------------------ | ---------------------- |
| Happy path                           | 4, 8, 13               |
| Foutafhandeling                      | 1, 2, 11               |
| Gemanipuleerde invoer                | 3, 10, 12, 17          |
| Businessregel                        | 6, 7, 15, 16           |
| Grensgeval                           | 21, 22, 25, 26, 27, 28 |
| Guard tegen ongewenste datawijziging | 9, 18                  |
| Weergave voor de reiziger            | 5, 14, 19, 20, 23, 24  |

| AC      | Hoofdpad | Alternatief pad |
| ------- | -------- | --------------- |
| AC-01.1 | 1        | 2, 3            |
| AC-01.2 | 4        | 5               |
| AC-01.3 | 6        | 7               |
| AC-01.4 | 8        | 9, 10           |
| AC-01.5 | 11       | 12              |
| AC-02.1 | 13       | 14              |
| AC-02.2 | 15       | 16, 17, 18      |
| AC-02.3 | 19       | 20, 21, 22      |
| AC-02.4 | 23       | 24, 25, 26      |
| OK-01   | 27       | 28              |

## 7. Bekende beperkingen

Deze punten worden niet als testfout gerapporteerd, maar als onderbouwde bevinding in het testrapport opgenomen:

- Bij precies 20% hoger (test 25) en net daarboven (test 26) staat op het scherm allebei "(+20%)", maar alleen bij test 26 verschijnt de waarschuwing. Dat klopt met AC-02.4: de grens wordt in hele centen berekend (eind × 100 > schatting × 120) en het percentage is afgerond voor de weergave. Voor een reiziger kan het verwarrend zijn. De acceptatietest vraagt daarom: "Was het duidelijk waarom je wel of geen waarschuwing kreeg?"
- De grensgevallen van AC-02.3 en AC-02.4 (tests 21, 22, 25 en 26) zijn via het scherm niet te maken: de demoknop geeft altijd +5% of een omweg. Ze worden getest met fixtures in de database. De weergave wordt dus getest, het ontstaan van zo'n eindprijs niet.
- Het afronden van een rit is een simulatie (demoknop). Een echte koppeling met de taximeter is buiten scope; de werkelijke afstand en duur komen in de tests altijd uit een van de twee scenario's.
- Precies 30 dagen is niet als grensgeval getest. Of een rit van precies 30 dagen wordt verwijderd, hangt af van het tijdstip waarop het script draait. Daarom zijn 29 en 31 dagen gekozen.
- Het opschoonscript wordt met de hand gestart. In productie wordt dit een geplande taak (onderbouwing in het ontwerpdocument); dat is niet getest.
- Iedereen met de ritlink kan de rit bekijken. Dat is bewust: er zijn geen accounts, en de uuid maakt de link niet te raden. Test 10 toont alleen aan dat een onbekende of ongeldige link niets oplevert.
- De wireframes tonen de URL's `/schatting` en `/rit/`; de applicatie gebruikt `/estimate` en `/ride/`. Dat is een bewuste keuze (Engelse URL's) en geen afwijking.

## 8. Exitcriteria

De testfase is afgerond wanneer:

- alle 28 testcases zijn uitgevoerd en van een werkelijk resultaat en status zijn voorzien;
- elk van de negen acceptatiecriteria en de ontwerpkeuze OK-01 minimaal één geslaagde test hebben;
- een testcase alleen als geslaagd telt als het werkelijke resultaat exact gelijk is aan het verwachte resultaat;
- elke afwijking is voorzien van een conclusie: opgelost, geaccepteerd met onderbouwing, of doorgeschoven als verbetervoorstel;
- de acceptatietest is uitgevoerd en de usability-vragen zijn beantwoord;
- het testrapport is opgeleverd.
