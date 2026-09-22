# Testrapport Sportschool De Kast (Hackathon 1, fase 3)

|               |                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Werkproces    | B1-K1-W4: Test software                                                                                                                                                                      |
| Kernflow      | US-01 (Toegang op abonnementstype) + US-02 (Abonnement annuleren)                                                                                                                            |
| Datum testrun | 22 september 2026, 12:29:09–12:29:33 (CEST)                                                                                                                                                  |
| Commit        | `f4000f5dbc12f77fddd8db0b865b4bda57127f0a` (branch `docs/documentation`, gebaseerd op `e6dd614`)                                                                                             |
| Uitvoerder    | Ahmad Alasmi                                                                                                                                                                                 |
| Testomgeving  | macOS, Node v24.20.0, Next.js 16.3.4 (dev-server, `DATABASE_URL` naar de testdatabase `dekast_test`), PostgreSQL 17 in Docker-container `dekast-db`, Cypress 16.1.0, Electron 146 (headless) |
| Testplan      | [De Kast - Testplan.docx](./De%20Kast%20-%20Testplan.docx) (14 september 2026)                                                                                                               |

Nummering van testcases, acceptatiecriteria (AC-01.1 t/m AC-02.4, NF-01 t/m NF-03) en
seedprofielen (M1 t/m M8) volgt het testplan.

**Hoe te lezen.** Alle vijftien testcases zijn geautomatiseerd uitgevoerd met `npx cypress run`.
Per stap is nagegaan of de Cypress-spec die stap echt controleert, via een assertion of een
`cy.task`-query. De 17 stappen die de spec niet (volledig) controleert, zijn op 22-09-2026
handmatig gecontroleerd door Ahmad Alasmi, in de ontwikkelomgeving, per testcase vanuit een verse
seed (`npm run db:seed`). Uitzonderingen: TC-15 bouwt bewust voort op de toestand na TC-14, en
TC-14 stap 1 is zonder nieuwe seed uitgevoerd en daarna op een verse seed nagecontroleerd (§5.3
punt 5). Die stappen staan in het rapport als "Handmatig gecontroleerd (22-09-2026)".

## 1. Samenvatting

|                                                          | Aantal                                                 |
| -------------------------------------------------------- | ------------------------------------------------------ |
| Testcases in het testplan                                | 15                                                     |
| Uitgevoerd (Cypress)                                     | 15                                                     |
| Geslaagd (Cypress)                                       | 15                                                     |
| Gefaald (Cypress)                                        | 0                                                      |
| Overgeslagen                                             | 0                                                      |
| Handmatig gecontroleerde teststappen                     | 17 (15 conform, 2 niet conform)                        |
| Teststappen met een afwijking van de testplanverwachting | 3 (TC-04 stap 2, TC-08 stap 5, TC-14 stap 1; zie §5.3) |
| Eindstatus testcases (geautomatiseerd + handmatig)       | 13 geslaagd, 2 niet geslaagd (TC-04, TC-14)            |

Cypress-uitvoer per spec:

| Spec               | Tests  | Geslaagd | Gefaald | Duur      |
| ------------------ | ------ | -------- | ------- | --------- |
| `abonnement.cy.ts` | 4      | 4        | 0       | 00:04     |
| `beheer.cy.ts`     | 2      | 2        | 0       | 864 ms    |
| `inchecken.cy.ts`  | 7      | 7        | 0       | 00:06     |
| `integratie.cy.ts` | 2      | 2        | 0       | 00:02     |
| **Totaal**         | **15** | **15**   | **0**   | **00:14** |

## 2. Testcases

Voor alle testcases geldt: "Test uitgevoerd door" is Ahmad Alasmi en "Test uitgevoerd op" is
22-09-2026. Specs staan in `cypress/e2e/`. Regelnummers verwijzen naar commit `f4000f5`.

### TC-01 | Geldige incheck wordt toegekend en gelogd

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.3, AC-01.5 ·
Test status: **Geslaagd**

| Stap | Test stap                                             | Verwacht resultaat                                                                                           | Werkelijk resultaat                                                                                                                                                                                                                                  | Geslaagd/niet geslaagd |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Ga naar het incheckscherm                             | Het formulier met lidnummer en pincode wordt zonder fouten weergegeven                                       | Conform verwacht (assertie in `inchecken.cy.ts:13` en `:16`: de velden accepteren invoer). Let op: de spec bezoekt `/check-in`, het testplan noemt `http://localhost:3000/`                                                                          | Geslaagd               |
| 2    | Vul het lidnummer en de juiste pincode in en bevestig | Welkomstscherm met de naam van het lid                                                                       | Welkomstscherm: conform verwacht (assertie in `inchecken.cy.ts:28`). Naam van het lid: handmatig gecontroleerd (22-09-2026), conform verwacht ("Welkom, Anna!")                                                                                      | Geslaagd               |
| 3    | Controleer de database op een nieuwe logregel         | Eén nieuw record met user_id van M1, actuele timestamp, gevuld subscription_type_id en access_granted = true | Nieuw record van M1 met access_granted = true: conform verwacht (cy.task-query in `inchecken.cy.ts:30–32`). Overige velden: handmatig gecontroleerd (22-09-2026) via de tabel op /beheer (naam, abonnement, datum & tijd, toegang), conform verwacht | Geslaagd               |
| 4    | Wacht tot de aftelbalk is afgelopen                   | Het scherm keert automatisch terug naar het incheckformulier                                                 | Handmatig gecontroleerd (22-09-2026): conform verwacht. Na 10 seconden keert het scherm terug naar het incheckformulier                                                                                                                              | Geslaagd               |

### TC-02 | Onjuiste pincode wordt geweigerd en gelogd

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.5 · Test status: **Geslaagd**

| Stap | Test stap                                                        | Verwacht resultaat                                                                     | Werkelijk resultaat                                                                                                              | Geslaagd/niet geslaagd |
| ---- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Vul het lidnummer van M1 in met een onjuiste pincode en bevestig | Weigeringsscherm met een neutrale melding die niet prijsgeeft of het lidnummer bestaat | Conform verwacht (assertie in `inchecken.cy.ts:40–41`: weigeringsscherm met de melding "Onjuist lidnummer of onjuiste pincode.") | Geslaagd               |
| 2    | Noteer de exacte tekst van de melding                            | Tekst vastgelegd voor vergelijking met TC-03                                           | Conform verwacht (assertie in `inchecken.cy.ts:41`: exacte tekst "Onjuist lidnummer of onjuiste pincode.")                       | Geslaagd               |
| 3    | Controleer de database op een nieuwe logregel                    | Eén nieuw record met user_id van M1 en access_granted = false                          | Conform verwacht (cy.task-query in `inchecken.cy.ts:46–48`)                                                                      | Geslaagd               |

### TC-03 | Onbekend lidnummer geeft dezelfde melding en geen logregel

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.5 (met onderbouwde afwijking, zie
§5.1) · Test status: **Geslaagd**

| Stap | Test stap                                                     | Verwacht resultaat                                     | Werkelijk resultaat                                                                        | Geslaagd/niet geslaagd |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------- |
| 1    | Tel het aantal records in visit_logs                          | Aantal genoteerd als beginstand                        | Conform verwacht (cy.task-query in `inchecken.cy.ts:54`)                                   | Geslaagd               |
| 2    | Vul lidnummer 999 met een willekeurige pincode in en bevestig | Weigeringsscherm met exact dezelfde tekst als in TC-02 | Conform verwacht (assertie in `inchecken.cy.ts:56–57`: dezelfde exacte tekst als in TC-02) | Geslaagd               |
| 3    | Tel het aantal records opnieuw                                | Aantal is ongewijzigd ten opzichte van stap 1          | Conform verwacht (cy.task-query in `inchecken.cy.ts:62–63`)                                | Geslaagd               |

### TC-04 | Bereikte bezoeklimiet wordt geweigerd met de voorgeschreven melding

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.2 ·
Test status: **Niet geslaagd (stap 2, zie §5.3 punt 6)**

| Stap | Test stap                                                          | Verwacht resultaat                                                               | Werkelijk resultaat                                                                                                                                                                                                                                                                    | Geslaagd/niet geslaagd |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Check in met het lidnummer en de juiste pincode van M2             | Weigeringsscherm met de tekst: Je hebt je bezoeklimiet al bereikt voor deze week | Conform verwacht (assertie in `inchecken.cy.ts:71–72`: exacte tekst). Screenshot `TC-04-limiet-bereikt.png` gemaakt                                                                                                                                                                    | Geslaagd               |
| 2    | Controleer of het scherm vermeldt wanneer het lid weer terecht kan | De verwijzing naar het volgende geldige moment is zichtbaar                      | Handmatig gecontroleerd (22-09-2026): **niet conform**. Het scherm toont de melding over de bezoeklimiet en in het hulppaneel de vaste tekst "Kom volgende week terug", maar geen concreet moment waarop het lid weer terecht kan. Door de tester beoordeeld als te vaag (§5.3 punt 6) | Niet geslaagd          |
| 3    | Controleer de database                                             | Eén nieuw record met access_granted = false; geen record met true                | Conform verwacht (cy.task-query in `inchecken.cy.ts:78–81`)                                                                                                                                                                                                                            | Geslaagd               |

### TC-05 | Eén bezoek onder de limiet geeft toegang

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.3 ·
Test status: **Geslaagd**

| Stap | Test stap                              | Verwacht resultaat                                             | Werkelijk resultaat                                                                                                          | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Check in met de juiste gegevens van M3 | Toegang verleend met welkomstmelding                           | Conform verwacht (assertie in `inchecken.cy.ts:90`)                                                                          | Geslaagd               |
| 2    | Check direct daarna nogmaals in met M3 | Weigering wegens bereikte limiet, want de teller staat nu op 2 | Handmatig gecontroleerd (22-09-2026): conform verwacht. De tweede poging wordt geweigerd met de melding over de bezoeklimiet | Geslaagd               |

### TC-06 | Onbeperkt abonnement krijgt nooit een weigermelding

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.4 ·
Test status: **Geslaagd**

| Stap | Test stap                                                 | Verwacht resultaat                                  | Werkelijk resultaat                                                                                                                 | Geslaagd/niet geslaagd |
| ---- | --------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Check in met de juiste gegevens van M4                    | Toegang verleend met welkomstmelding                | Conform verwacht (assertie in `inchecken.cy.ts:95`)                                                                                 | Geslaagd               |
| 2    | Controleer het scherm op een weigermelding of limiettekst | Geen enkele weigermelding of limiettekst zichtbaar  | Handmatig gecontroleerd (22-09-2026): conform verwacht. Geen weigermelding of limiettekst; bij bezoeken deze week staat "onbeperkt" | Geslaagd               |
| 3    | Controleer het abonnementstype in de database             | subscription_limit is NULL voor dit abonnementstype | Handmatig gecontroleerd (22-09-2026): conform verwacht. subscription_limit van Premium is NULL (tabel `"Subscriptions"`)            | Geslaagd               |

### TC-07 | De bezoekteller reset op maandag

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-01.1 ·
Test status: **Geslaagd**

| Stap | Test stap                              | Verwacht resultaat                                                         | Werkelijk resultaat                                                                                            | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Check in met de juiste gegevens van M5 | Toegang verleend; de bezoeken van vorige week tellen niet mee              | Conform verwacht (assertie in `inchecken.cy.ts:100`)                                                           | Geslaagd               |
| 2    | Check een tweede keer in met M5        | Toegang verleend; dit is het tweede bezoek van deze week                   | Handmatig gecontroleerd (22-09-2026): conform verwacht. De tweede incheck krijgt toegang                       | Geslaagd               |
| 3    | Check een derde keer in met M5         | Weigering wegens bereikte limiet; de bezoeken van deze week tellen wél mee | Handmatig gecontroleerd (22-09-2026): conform verwacht. De derde poging wordt geweigerd wegens de bezoeklimiet | Geslaagd               |

### TC-08 | Volledige opzegflow met correcte einddatum

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-02.1, AC-02.2, AC-02.3, AC-02.4 ·
Test status: **Geslaagd; stap 5 wijkt af van het testplan (§5.3 punt 1)**

| Stap | Test stap                                                       | Verwacht resultaat                                                                   | Werkelijk resultaat                                                                                                                                                                                                                                                 | Geslaagd/niet geslaagd               |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1    | Log in op het abonnementsscherm met lidnummer en pincode van M1 | Het overzicht toont het abonnementstype en de status actief                          | Handmatig gecontroleerd (22-09-2026): conform verwacht. Het overzicht toont abonnement Plus en status Actief                                                                                                                                                        | Geslaagd                             |
| 2    | Klik op opzeggen                                                | Bevestigingsscherm met de tekst dat er nog niets wordt gewijzigd totdat je bevestigt | Conform verwacht (assertie in `abonnement.cy.ts:38`: "Er wordt nog niets gewijzigd totdat je hieronder bevestigt.")                                                                                                                                                 | Geslaagd                             |
| 3    | Controleer de database vóór bevestiging                         | subscription_end is nog steeds NULL                                                  | Handmatig gecontroleerd (22-09-2026): conform verwacht. subscription_end is NULL vóór bevestiging                                                                                                                                                                   | Geslaagd                             |
| 4    | Bevestig de opzegging                                           | Bevestigingsbericht met de datum tot wanneer de toegang geldig blijft                | Conform verwacht (assertie in `abonnement.cy.ts:43`: het bericht bevat de einddatum)                                                                                                                                                                                | Geslaagd                             |
| 5    | Controleer de database na bevestiging                           | subscription_end is gevuld met de eerstvolgende 5e van de maand                      | subscription_end is gevuld met de **dag vóór** de eerstvolgende 5e (in deze run 2026-10-04 in plaats van 2026-10-05). De spec controleert die waarde (cy.task-query in `abonnement.cy.ts:48–49`) en is groen, maar dat is niet de waarde uit het testplan. Zie §5.3 | Afwijking t.o.v. testplan – zie §5.3 |

### TC-09 | Terugkeren zonder bevestigen wijzigt niets

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-02.1, AC-02.2 ·
Test status: **Geslaagd**

| Stap | Test stap                                          | Verwacht resultaat                                                    | Werkelijk resultaat                                                                                                                                          | Geslaagd/niet geslaagd |
| ---- | -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 1    | Log in en klik op opzeggen                         | Het bevestigingsscherm verschijnt                                     | Conform verwacht (impliciete bestaanscontrole: `cy.get(...).click()` op de annuleerknop in `abonnement.cy.ts:57` faalt als het bevestigingsscherm ontbreekt) | Geslaagd               |
| 2    | Keer terug naar het overzicht zonder te bevestigen | Het overzicht toont de status actief en de opzegknop is nog zichtbaar | Opzegknop zichtbaar: conform verwacht (assertie in `abonnement.cy.ts:58`). Status Actief: handmatig gecontroleerd (22-09-2026), conform verwacht             | Geslaagd               |
| 3    | Controleer de database                             | subscription_end is nog steeds NULL                                   | Conform verwacht (cy.task-query in `abonnement.cy.ts:60–61`)                                                                                                 | Geslaagd               |

### TC-10 | Opzeggen op de verlengdag zelf geeft een extra cyclus

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-02.3 · Test status: **Geslaagd**

| Stap | Test stap                              | Verwacht resultaat                                    | Werkelijk resultaat                                                                                                                                                         | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Log in, zeg op en bevestig             | Bevestigingsbericht met een einddatum                 | Conform verwacht (assertie in `abonnement.cy.ts:77`)                                                                                                                        | Geslaagd               |
| 2    | Controleer de einddatum in de database | subscription_end ligt een maand vooruit, niet vandaag | Conform verwacht (cy.task-query in `abonnement.cy.ts:82–83`). In deze run was de einddatum 2026-10-21: de dag vóór de verlengdag 22 oktober, dus niet vandaag. Zie ook §5.3 | Geslaagd               |

### TC-11 | Een al opgezegd abonnement kan niet opnieuw worden opgezegd

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-02.1, AC-02.4 · Test status: **Geslaagd**

| Stap | Test stap                              | Verwacht resultaat                                                              | Werkelijk resultaat                                          | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------- |
| 1    | Noteer de huidige einddatum van M6     | Waarde genoteerd als beginstand                                                 | Conform verwacht (cy.task-query in `abonnement.cy.ts:89`)    | Geslaagd               |
| 2    | Log in op het abonnementsscherm met M6 | Het overzicht toont de status opgezegd met de einddatum; de opzegknop ontbreekt | Conform verwacht (assertie in `abonnement.cy.ts:91–92`)      | Geslaagd               |
| 3    | Controleer de einddatum opnieuw        | Ongewijzigd ten opzichte van stap 1                                             | Conform verwacht (cy.task-query in `abonnement.cy.ts:97–98`) | Geslaagd               |

### TC-12 | Opgezegd lid houdt toegang tot de einddatum

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-02.3, AC-01.3 ·
Test status: **Geslaagd**

| Stap | Test stap                              | Verwacht resultaat                     | Werkelijk resultaat                                                                            | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Check in met de juiste gegevens van M6 | Toegang verleend met welkomstmelding   | Conform verwacht (assertie in `integratie.cy.ts:27`)                                           | Geslaagd               |
| 2    | Controleer de database                 | Nieuw record met access_granted = true | Handmatig gecontroleerd (22-09-2026): conform verwacht. Nieuwe rij van M6 met toegang verleend | Geslaagd               |

### TC-13 | Na de einddatum wordt toegang geweigerd

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: AC-02.3 ·
Test status: **Geslaagd**

| Stap | Test stap                              | Verwacht resultaat                                                                       | Werkelijk resultaat                                                                                              | Geslaagd/niet geslaagd |
| ---- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Check in met de juiste gegevens van M7 | Weigering met als reden dat het abonnement is beëindigd, niet met de bezoeklimietmelding | Conform verwacht (assertie in `integratie.cy.ts:32–33`: weigeringsscherm met exact de kop "Abonnement verlopen") | Geslaagd               |
| 2    | Controleer de database                 | Nieuw record met access_granted = false                                                  | Handmatig gecontroleerd (22-09-2026): conform verwacht. Nieuwe rij van M7 met toegang geweigerd                  | Geslaagd               |

### TC-14 | Anonimiseren raakt alleen logs ouder dan 14 dagen

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: NF-03 ·
Test status: **Niet geslaagd (stap 1, zie §5.3 punt 5)**

| Stap | Test stap                               | Verwacht resultaat                                                                            | Werkelijk resultaat                                                                                                                                                                                                                                                                                                                                                                                               | Geslaagd/niet geslaagd |
| ---- | --------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open het beheerscherm                   | De tabel toont beide logs met de naam van het lid; de anonimiseerknop is actief               | Knop actief: conform verwacht (impliciete controle: `click()` in `beheer.cy.ts:23` faalt op een uitgeschakelde knop). Namen in de tabel: handmatig gecontroleerd (22-09-2026), **niet conform**. De log van 21 dagen oud toont al "Anoniem" vóór het anonimiseren; de log van vandaag toont de naam. Nagecontroleerd op een verse seed met dezelfde servercode (`haalBezoeklogs`): zelfde resultaat (§5.3 punt 5) | Niet geslaagd          |
| 2    | Start het anonimiseren en bevestig      | Bevestiging dat de logs ouder dan 14 dagen zijn geanonimiseerd                                | Conform verwacht (assertie in `beheer.cy.ts:25`: het klaarscherm met de knop "Terug naar overzicht" is zichtbaar). De tekst met het aantal wordt niet gecontroleerd                                                                                                                                                                                                                                               | Geslaagd               |
| 3    | Bekijk de tabel opnieuw                 | De log van 21 dagen oud toont Anoniem; de log van vandaag toont nog de naam                   | Handmatig gecontroleerd (22-09-2026): conform verwacht. De oude log toont "Anoniem", de log van vandaag de naam                                                                                                                                                                                                                                                                                                   | Geslaagd               |
| 4    | Controleer beide records in de database | Oude log: user_id is NULL en subscription_type_id is nog gevuld. Log van vandaag: ongewijzigd | Conform verwacht (cy.task-query in `beheer.cy.ts:29–35`). Van de log van vandaag wordt alleen user_id gecontroleerd                                                                                                                                                                                                                                                                                               | Geslaagd               |

### TC-15 | Knop is inactief als er niets te anonimiseren valt

Test uitgevoerd op: 22-09-2026 · Acceptatiecriterium: NF-03 ·
Test status: **Geslaagd**

| Stap | Test stap                     | Verwacht resultaat                                             | Werkelijk resultaat                                                                                                               | Geslaagd/niet geslaagd |
| ---- | ----------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | Open het beheerscherm         | De anonimiseerknop is zichtbaar maar grijs en niet aanklikbaar | Conform verwacht (assertie in `beheer.cy.ts:44`: de knop bestaat en is `disabled`). Of de knop grijs is, wordt niet gecontroleerd | Geslaagd               |
| 2    | Probeer op de knop te klikken | Er gebeurt niets en er verandert niets in de database          | Handmatig gecontroleerd (22-09-2026): conform verwacht. Klikken doet niets en het aantal geanonimiseerde logs blijft gelijk       | Geslaagd               |

## 3. Dekkingstabel

Geslaagde TC's per criterium. Het gaat om de TC's waarvan de Cypress-test groen is en waarvan
de stap die het criterium raakt geautomatiseerd is gecontroleerd.

| Criterium | Omschrijving (kort)                                       | Geslaagde TC's          | Opmerking                                                                                                                                                                                                      |
| --------- | --------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01.1   | Abonnementstypen, weekteller reset op maandag             | TC-07                   | Stap 1 geautomatiseerd, stap 2–3 handmatig gecontroleerd                                                                                                                                                       |
| AC-01.2   | Limiet bereikt → weigering + voorgeschreven melding       | TC-04 (stap 1 en 3)     | Weigering en melding geslaagd. TC-04 stap 2 (concreet terugkommoment) is niet geslaagd; dat valt buiten de tekst van AC-01.2 (§5.3 punt 6)                                                                     |
| AC-01.3   | Limiet niet bereikt → toegang + welkomstmelding           | TC-01, TC-05, TC-12     |                                                                                                                                                                                                                |
| AC-01.4   | Onbeperkt → nooit een weigermelding                       | TC-06                   |                                                                                                                                                                                                                |
| AC-01.5   | Elke toegangspoging wordt gelogd                          | TC-01, TC-02, TC-03     | TC-03 met onderbouwde afwijking (§5.1)                                                                                                                                                                         |
| AC-02.1   | Opzeggen via expliciet te submitten bevestigingsformulier | TC-08, TC-09, TC-11     |                                                                                                                                                                                                                |
| AC-02.2   | Niet submitten = abonnement ongewijzigd                   | TC-08, TC-09            | TC-08 stap 3 handmatig gecontroleerd                                                                                                                                                                           |
| AC-02.3   | Toegang actief tot eerstvolgende vervaldatum              | TC-10, TC-12, TC-13     | TC-08 stap 5 wijkt af van het testplan (§5.3)                                                                                                                                                                  |
| AC-02.4   | Bevestigingsbericht van de annulering                     | TC-08, TC-11            |                                                                                                                                                                                                                |
| NF-01     | Bezoeklogs beperkt tot geautoriseerde medewerkers         | —                       | Geen testcase in het testplan. /beheer is niet afgeschermd (§5.1, punt 6)                                                                                                                                      |
| NF-02     | Pincodes gehasht opgeslagen                               | —                       | Vastgesteld bij codereview, niet via UI (`src/db/seed.ts` slaat `hashSync(...)` op in `pin_hash`; `src/server/inchecken/toegang.ts` en `src/server/abonnement/abonnement.ts` vergelijken met `bcrypt.compare`) |
| NF-03     | Bezoeklogs na 14 dagen geanonimiseerd                     | TC-14 (stap 2–4), TC-15 | Het anonimiseren zelf is geslaagd. TC-14 stap 1 (weergave vóór het anonimiseren) is niet geslaagd (§5.3 punt 5)                                                                                                |

## 4. Gebruikte testdata

Seed: `src/db/seed.ts`, via `cy.task("seed")` vóór en na elke test. De profielen zijn
aanwezig. Afwijkingen van hoofdstuk 3 van het testplan:

| Profiel | Testplan                                              | Seed (werkelijk)                                                          |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| M1      | Basic, 2 p/w, 0 bezoeken deze week                    | Plus (limiet 2), 0 bezoeken deze week, startdatum op de 5e, niet opgezegd |
| M2      | Basic, 2 p/w, 2 bezoeken deze week                    | Plus (limiet 2), 2 geslaagde bezoeken deze week                           |
| M3      | Basic, 2 p/w, 1 bezoek deze week                      | Plus (limiet 2), 1 geslaagd bezoek deze week                              |
| M4      | Premium, onbeperkt, 3 bezoeken deze week              | Premium (limiet NULL), 3 geslaagde bezoeken deze week                     |
| M5      | Basic, 2 p/w, 2 bezoeken vóór afgelopen maandag       | Plus (limiet 2), 2 geslaagde bezoeken vóór afgelopen maandag              |
| M6      | Basic, 2 p/w, opgezegd, einde in de toekomst          | Plus (limiet 2), subscription_end = vandaag + 12 dagen                    |
| M7      | Basic, 2 p/w, opgezegd, einde in het verleden         | Plus (limiet 2), subscription_end = gisteren                              |
| M8      | Basic, 2 p/w, startdag = dag-van-de-maand van vandaag | Plus (limiet 2), startdatum 2 maanden geleden op dezelfde dag             |

- De seed noemt het abonnement met limiet 2 "Plus". In het testplan heet het "Basic". De seed
  heeft daarnaast "Basis" (limiet 1), maar geen enkel testlid gebruikt dat abonnement. Het
  gedrag (limiet 2) komt overeen.
- M6 en M7 staan in het testplan als "nog toe te voegen". Ze staan inmiddels in de seed.
- Bezoeklogs: een log van 21 dagen oud (M1), een al geanonimiseerde log (40 dagen oud, user_id
  NULL) en een log van "vandaag" (M4). Dat komt overeen met het testplan.

## 5. Afwijkingen en bevindingen

### 5.1 Bekende beperkingen uit hoofdstuk 7 van het testplan

| #   | Beperking (testplan H7)                                                                          | Bevinding in deze run                                                                                                                                                       | Conclusie                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Onbekend lidnummer levert geen logregel op, terwijl AC-01.5 over "elke poging" spreekt           | TC-03 is groen: dezelfde melding en geen nieuwe rij. In de code zit dit in `verwerkIncheck` (`src/server/inchecken/toegang.ts`): bij een onbekend lid wordt niets gelogd    | **Geaccepteerd met onderbouwing**: zonder identiteit en abonnementstype is een rij alleen ruis, en hij zou gegevens vastleggen over een niet-geïdentificeerd persoon (privacy-afweging uit het testplan) |
| 2   | Het klemmen van de einddatum bij korte maanden (start op de 31e → 28/29 februari) is niet getest | Niet getest, zoals gepland. De logica staat in `eindeHuidigeMaandcyclus` / `klemNaarMaand` in `src/lib/datum.ts`                                                            | **Geaccepteerd risico, doorgeschoven als verbetervoorstel** (§8, punt 3)                                                                                                                                 |
| 3   | Opzeggen op de verlengdag zelf geeft een volledige extra cyclus                                  | TC-10 is groen. De code telt de verlengdag zelf als verstreken (`verleng.getTime() <= vandaag.getTime()` in `src/lib/datum.ts`)                                             | **Geaccepteerd met onderbouwing**: een bewuste keuze, geen bug (testplan H7)                                                                                                                             |
| 4   | Een mislukte inlogpoging op /abonnement wordt nergens vastgelegd                                 | Bevestigd bij codereview: `verifieerLid` in `src/server/abonnement/abonnement.ts` logt niets, ook niet naar de console. Inchecken logt wel (`console.warn` en `visit_logs`) | **Verbetervoorstel** (§8, punt 4). visit_logs gaat over bezoeken, niet over accountlogins                                                                                                                |
| 5   | Geen rem op herhaald pincode-raden op beide schermen                                             | Bevestigd bij codereview: in `src/server/inchecken/` en `src/server/abonnement/` zit geen begrenzing van het aantal pogingen                                                | **Verbetervoorstel** (§8, punt 1)                                                                                                                                                                        |
| 6   | /beheer is niet afgeschermd met een medewerkersrol                                               | Bevestigd: `app/beheer/page.tsx` regel 3–5 vermeldt dit expliciet. Daardoor wordt NF-01 niet gerealiseerd                                                                   | **Geaccepteerd met onderbouwing** (bewust buiten de scope van de kernflow) **en verbetervoorstel** (§8, punt 2)                                                                                          |

### 5.2 Bugs gevonden tijdens het testen

Fix-commits uit de testperiode, na het opzetten van Cypress in `747a3e4` op 17-09-2026:

| Commit                                                                    | Datum      | Bevinding                                                                                                                                                 | Gevonden door                             | Conclusie                          |
| ------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `640948a` fix(h1): use exact AC-01.2 wording for the weekly limit message | 17-09-2026 | De melding bij een bereikte weeklimiet was "Je hebt deze week het maximale aantal bezoeken van je abonnement bereikt." in plaats van de tekst uit AC-01.2 | TC-04 (exacte tekstcontrole)              | **Opgelost**; TC-04 is groen       |
| `3ea6f1c` fix(h1): keep DATE columns as plain strings in the query task   | 17-09-2026 | Fout in de testopzet, niet in de applicatie: de `query`-task gaf DATE-kolommen terug als JS-Date, waardoor datumvergelijkingen in de specs faalden        | TC-08, TC-10, TC-11 (datumvergelijkingen) | **Opgelost**; die tests zijn groen |

### 5.3 Afwijkingen tussen testplan en implementatie

| #   | Afwijking                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Conclusie                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **TC-08 stap 5**: volgens het testplan wordt subscription_end "de eerstvolgende 5e". De implementatie zet de **dag vóór** de eerstvolgende 5e (`eindeHuidigeMaandcyclus` in `src/lib/datum.ts`: "loopt de toegang door tot en met de dag vóór de eerstvolgende verlengdatum"). De einddatum zelf geeft nog toegang (`abonnementVerlopen` in `toegang.ts`), dus de toegang stopt op de 5e zelf. De Cypress-spec toetst de implementatie (dag vóór), niet de tekst van het testplan                                                                        | **Geaccepteerd met onderbouwing**: het lid heeft toegang tot en met de dag vóór de verlengdatum en verliest die op de verlengdatum zelf. Dat is precies wat AC-02.3 vraagt ("toegang actief tot de eerstvolgende maandelijkse vervaldatum"). Alleen de formulering in het testplan ("subscription_end is de eerstvolgende 5e") is onnauwkeurig; die wordt in een volgende versie van het testplan verduidelijkt     |
| 2   | De SQL in het testplan gebruikt namen die niet in het schema staan: `visit_logs.id` (werkelijk `visit_id`), `created_at` (werkelijk `visit_date`), `users` (werkelijk `"Users"`), `subscription_types` (werkelijk `"Subscriptions"`)                                                                                                                                                                                                                                                                                                                     | Geen invloed op de geautomatiseerde tests. Bij de handmatige controle zijn de werkelijke namen gebruikt                                                                                                                                                                                                                                                                                                             |
| 3   | TC-01 stap 1 noemt `http://localhost:3000/` als incheckscherm. De spec gebruikt `/check-in`; `/` is een menu met links                                                                                                                                                                                                                                                                                                                                                                                                                                   | Geen invloed op het resultaat. Bij handmatige controle `/check-in` gebruiken                                                                                                                                                                                                                                                                                                                                        |
| 4   | Abonnementsnamen in het testplan ("Basic") verschillen van de seed ("Plus"), zie §4                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Geen invloed: de limiet (2 per week) komt overeen                                                                                                                                                                                                                                                                                                                                                                   |
| 5   | **TC-14 stap 1**: het testplan verwacht dat de tabel op /beheer vóór het anonimiseren beide logs met de naam van het lid toont. Bij de handmatige controle toonde de log van 21 dagen oud al "Anoniem". Nagecontroleerd op een verse seed: de status meldt nog 1 log met een lidnummer, maar de tabel toont die log als "Anoniem". Oorzaak: `haalBezoeklogs` in `src/server/beheer/anonimiseren.ts` maskeert elke log van vóór de grens van 14 dagen, ook als `user_id` nog gevuld is ("Zo klopt het overzicht al vóór er op 'Anonimiseren' is geklikt") | **Geaccepteerd met onderbouwing**: de maskering is een bewuste keuze in de code. Zo toont het beheerscherm geen namen bij bezoeken die volgens de AVG-regel niet meer herleidbaar horen te zijn. Het anonimiseren zelf werkt (TC-14 stap 2–4). Nadeel: de medewerker ziet in de tabel niet welke logs nog echt geanonimiseerd moeten worden, alleen het aantal in de statusregel. **Verbetervoorstel** (§8, punt 6) |
| 6   | **TC-04 stap 2**: het testplan verwacht dat het weigeringsscherm vermeldt wanneer het lid weer terecht kan. Het scherm toont alleen de vaste tekst "Kom volgende week terug" (`app/check-in/_components/Resultaat.tsx`), zonder concrete dag of datum. Door de tester beoordeeld als te vaag: niet conform                                                                                                                                                                                                                                               | **Verbetervoorstel** (§8, punt 5). AC-01.2 vraagt alleen om een weigering met de voorgeschreven melding, en die is geslaagd (TC-04 stap 1). Een concreet terugkommoment is een terechte verbetering voor het lid                                                                                                                                                                                                    |

## 6. Toetsing aan de exitcriteria (testplan hoofdstuk 8)

| Exitcriterium                                                                                                      | Oordeel                      | Bewijs                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alle vijftien testcases zijn uitgevoerd en hebben een werkelijk resultaat en een status                            | **Voldaan**                  | Alle 15 zijn geautomatiseerd uitgevoerd (15/15 groen in Cypress, §1). De 17 niet-geautomatiseerde stappen zijn op 22-09-2026 handmatig gecontroleerd. Elke stap en elke testcase heeft een werkelijk resultaat en een status (§2)       |
| Elk van de negen acceptatiecriteria heeft minimaal één geslaagde test                                              | **Voldaan**                  | Dekkingstabel §3: AC-01.1 t/m AC-02.4 hebben elk minimaal één geslaagde TC                                                                                                                                                              |
| Elke afwijking heeft een conclusie: opgelost, geaccepteerd met onderbouwing, of doorgeschoven als verbetervoorstel | **Voldaan**                  | §5.1, §5.2 en §5.3 hebben allemaal een conclusie: 2 bugs opgelost (§5.2); TC-08 stap 5 en TC-14 stap 1 geaccepteerd met onderbouwing; TC-04 stap 2 en de beperkingen uit H7 doorgeschoven als verbetervoorstel waar van toepassing (§8) |
| Het testrapport is opgeleverd                                                                                      | **Voldaan** met dit document | `docs/testen/testrapport.md`. Er is nog geen .docx-versie gemaakt                                                                                                                                                                       |

## 7. Conclusie

De software voldoet aan de negen acceptatiecriteria uit fase 1 (AC-01.1 t/m AC-02.4): elk
criterium heeft minimaal één geslaagde test. Alle 15 testcases zijn geautomatiseerd geslaagd, en
na de handmatige controle zijn 13 van de 15 testcases volledig geslaagd. NF-03 (anonimiseren na
14 dagen) is aangetoond. NF-02 is bij codereview vastgesteld.

Twee testcases zijn op één stap niet geslaagd. Beide stappen gaan verder dan de letterlijke tekst
van het acceptatiecriterium:

- TC-04 stap 2: het weigeringsscherm noemt geen concreet moment waarop het lid terug kan komen
  (§5.3 punt 6).
- TC-14 stap 1: het beheerscherm toont oude logs al als "Anoniem" vóór het anonimiseren (§5.3
  punt 5).

De afwijkingen hebben allemaal een conclusie (§5.3):

- TC-08 stap 5 (einddatum de dag vóór de verlengdatum): geaccepteerd met onderbouwing.
- TC-14 stap 1 (oude logs al "Anoniem" vóór het anonimiseren): geaccepteerd met onderbouwing, met
  een verbetervoorstel.
- TC-04 stap 2 (geen concreet terugkommoment): verbetervoorstel.

NF-01 is niet gerealiseerd: /beheer is voor iedereen bereikbaar. Dat is bewust buiten de scope van
de kernflow gehouden en staat als verbetervoorstel in §8.

**Eindoordeel:** de software voldoet aan de negen acceptatiecriteria uit fase 1. Aan alle
exitcriteria uit hoofdstuk 8 van het testplan is voldaan. De testfase is afgerond, met twee
geaccepteerde afwijkingen en zes verbetervoorstellen.

## 8. Verbetervoorstellen

1. **Rem op herhaald pincode-raden, op beide schermen** (/check-in en /abonnement). Nu is het
   aantal pogingen per lidnummer onbeperkt (§5.1 punt 5). Voorstel: na een aantal mislukte pogingen
   binnen een tijdvenster tijdelijk weigeren. De controle hoort in de server action; een
   frontendcontrole is geen beveiliging.
2. **Medewerkersrol op /beheer.** Het scherm is nu voor iedereen bereikbaar, waardoor NF-01 niet
   wordt gehaald (§5.1 punt 6). Voorstel: inloggen met een medewerkersrol, en controle van die rol
   in de server actions van `src/server/beheer/actions.ts`.
3. **Klemmen van de einddatum bij korte maanden.** Voorstel: een unittest op
   `eindeHuidigeMaandcyclus` in `src/lib/datum.ts`. De functie krijgt `moment` al als parameter
   mee, dus de systeemdatum kan vastgezet worden zonder testhook in de productiecode. Testbasis is
   het voorbeeld uit het testplan (start op de 31e, opzeggen in januari, verlenging geklemd naar
   28/29 februari). De verwachte einddatum volgt de geaccepteerde regel uit §5.3
   punt 1: de dag vóór de (geklemde) verlengdatum (§5.1 punt 2).
4. **Logging van mislukte logins op /abonnement.** Nu wordt een mislukte login nergens vastgelegd,
   terwijl inchecken dat wel doet (§5.1 punt 4). Voorstel: een mislukte login minimaal vastleggen,
   zoals bij inchecken met `console.warn`, zonder pincode. Dit hangt samen met punt 1.
5. **Concreet terugkommoment bij een bereikte weeklimiet.** Nu toont het weigeringsscherm alleen
   "Kom volgende week terug" (§5.3 punt 6). Voorstel: de datum tonen waarop de telling opnieuw
   begint (de eerstvolgende maandag). Die grens berekent `laatsteMaandag` in `src/lib/datum.ts` al.
6. **Te anonimiseren logs herkenbaar maken op /beheer.** Nu tonen logs van vóór de grens al
   "Anoniem" voordat er geanonimiseerd is (§5.3 punt 5). Voorstel: die logs in de tabel apart
   markeren (bijvoorbeeld "wordt geanonimiseerd"), zodat de medewerker ziet welke rijen de knop
   zal raken.
