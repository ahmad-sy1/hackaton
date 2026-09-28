# Testplan Sportschool De Kast (Hackathon 1, fase 3)

Werkproces: B1-K1-W4: Test software\
Kernflow: US-01 (Toegang op abonnementstype) + US-02 (Abonnement annuleren)\
Datum: 14 september 2026\
Status: vastgesteld vóór uitvoering van de tests

## 1. Doel en scope

Dit testplan legt vast hoe wordt aangetoond dat de gerealiseerde software voldoet aan de acceptatiecriteria uit fase 1.

### In scope

- US-01: Toegang op abonnementstype (5 acceptatiecriteria)
- US-02: Abonnement annuleren (4 acceptatiecriteria)
- Het integratiepunt tussen beide stories: een opgezegd lid dat incheckt
- Het beheerscherm /beheer voor het anonimiseren van bezoeklogs

### Buiten scope

- Performancetests: geen performance-eis in de casus, en het verkeersvolume van één sportschool is verwaarloosbaar
- Cross-browser- en mobiele tests: de kiosk draait op één vaste machine met één browser
- Authenticatie op /beheer: bewust niet gebouwd, staat als bekende beperking in de ontwerptoelichting
- Het klemmen van de einddatum bij korte maanden (startdatum op de 31e → 28/29 februari), zie hoofdstuk 6

## 2. Testvorm en verantwoording

Alle tests in dit plan zijn geautomatiseerde end-to-end-tests met Cypress, uitgevoerd als integratietest.

Onderbouwing. De applicatie bestaat uit dunne lagen: de kioskpagina roept een server action aan, die roept een business regel achter de poort-interface aan, en die praat via Drizzle met de database. Elke laag op zich doet weinig. Het risico zit in de koppeling ertussen. Geeft de business regel een weiger reden terug die ook echt leesbaar op het scherm belandt, en staat er daarna een rij in visit_logs? Dat zie je alleen als je het hele pad aflegt.

Cypress doet precies dat: typen, klikken, wachten op de server action. Via cy.task kan ik daarnaast in de database kijken hoe de situatie voor en na de test is. Zo toets ik elk acceptatiecriterium op het niveau waarop het is afgesproken, namelijk wat het lid bij de deur of op zijn scherm merkt.

Ik heb bewust voor één testniveau gekozen in plaats van een piramide van unit-, integratie- en systeemtests. Dat past bij de omvang en de tijd die voor dit project staat. Het kost me dekking op één punt, een rekenregel die pas bij een andere systeemdatum zichtbaar wordt. Die keuze is bewust gemaakt, zie hoofdstuk 6.

Ik heb geen methodiek als TMap of ISTQB volledig gevolgd. De kern ervan zit er wel in: van testbasis naar testgevallen met testdata en verwacht resultaat, uitvoeren, en rapporteren met conclusies.

## 3. Testomgeving en testdata

- Lokale ontwikkelomgeving: Next.js App Router, PostgreSQL in een Docker-container, aparte testdatabase
- seedDatabase() draait via cy.task("seed") in beforeEach van elke spec
- seed.ts doet TRUNCATE ... RESTART IDENTITY CASCADE, dus lidnummers liggen vast en elke test start vanuit dezelfde toestand
- Assertions landen op elementen met een data-testid, niet op tekst of CSS-klassen

Datums relatief aan vandaag. Alle datums in de seed worden berekend ten opzichte van de uitvoerdatum, niet hardcoded. Een test die in september slaagt en in maart faalt, is geen test maar een tijdbom.

Benodigde seedprofielen. Controleer vóór uitvoering of seed.ts deze profielen bevat; M6 en M7 moeten nog worden toegevoegd.

| Proefiel | Abonnement | Limiet    | Situatie                                                     |
| -------- | ---------- | --------- | ------------------------------------------------------------ |
| M1       | Basic      | 2 p/w     | 0 bezoeken deze week                                         |
| M2       | Basic      | 2 p/w     | 2 bezoeken deze week (limiet bereikt)                        |
| M3       | Basic      | 2 p/w     | 1 bezoek deze week (net onder de limiet)                     |
| M4       | Premium    | Onbeperkt | 3 bezoeken deze week                                         |
| M5       | Basic      | 2 p/w     | 2 bezoeken vóór afgelopen maandag, 0 daarna                  |
| M6       | Basic      | 2 p/w     | opgezegd, subscription_end in de toekomst                    |
| M7       | Basic      | 2 p/w     | opgezegd, subscription_end in het verleden                   |
| M8       | Basic      | 2 p/w     | startdatum op de dag-van-de-maand van vandaag, niet opgezegd |

Bezoeklogs in de seed: één log van 21 dagen oud (nog niet geanonimiseerd), één al geanonimiseerde log (user_id NULL) en één log van vandaag.

## 4. Testscenario's

Elk scenario is in Given/When/Then geschreven, zodat het één op één herbruikbaar is als Cypress-specnaam. Eén test kan meerdere acceptatiecriteria raken; de kolom AC laat zien welke.

### Nummering van de acceptatiecriteria

In het ontwerpdocument staan de acceptatiecriteria als opsomming zonder nummers. Voor de traceerbaarheid krijgen ze in dit testplan een nummer; de tekst is ongewijzigd overgenomen uit het ontwerpdocument.

US-01 - Toegang op abonnementstype

| Nr      | Acceptatiecriterium                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------- |
| AC-01.1 | Abonnementstypen: 1×/week, 2×/week, onbeperkt. Bezoekteller reset elke week (bijv. maandag)         |
| AC-01.2 | Bij limiet bereikt: toegang geweigerd + melding "Je hebt je bezoeklimiet al bereikt voor deze week" |
| AC-01.3 | Bij limiet niet bereikt: toegang toegekend + welkomstmelding                                        |
| AC-01.4 | Onbeperkt-abonnement: nooit een weigermelding                                                       |
| AC-01.5 | Elke toegangspoging (geslaagd én geweigerd) wordt gelogd met: wie, wanneer, abonnementstype, status |

US-02 - Abonnement annuleren

| Nr      | Acceptatiecriterium                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------- |
| AC-02.1 | Sporter zet zelf het abonnement stop via een bevestigingsformulier dat expliciet gesubmit moet worden |
| AC-02.2 | Niet submitten = abonnement blijft ongewijzigd actief                                                 |
| AC-02.3 | Na bevestigde opzegging blijft toegang actief tot de eerstvolgende maandelijkse vervaldatum           |
| AC-02.4 | Sporter ontvangt een bevestigingsbericht van de annulering                                            |

Daarnaast worden twee niet-functionele eisen uit het ontwerpdocument getest: NF-01 (bezoeklogs zijn beperkt tot geautoriseerde medewerkers) en NF-03 (bezoeklogs worden na 14 dagen geanonimiseerd, user_id losgekoppeld). NF-02 (pincodes gehasht opgeslagen) wordt niet apart getest: dat is via de gebruikersinterface niet waarneembaar en is bij de codereview vastgesteld.

inchecken.cy.ts

| #   | Scenario                                                                                                                                                                      | Testdata                     | Verwacht resultaat                                                                                                                 | AC               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Gegeven een actief lid binnen zijn bezoeklimiet, wanneer het lid incheckt met het juiste lidnummer en de juiste pincode, dan wordt toegang verleend en wordt de poging gelogd | M1, juiste pincode           | Welkomstscherm met naam; precies één nieuwe rij in visit_logs met user_id, tijdstip, subscription_type_id en access_granted = true | AC-01.3, AC-01.5 |
| 2   | Gegeven een bestaand lid, wanneer het lid incheckt met een onjuiste pincode, dan wordt toegang geweigerd en wordt de poging gelogd                                            | M1, foute pincode            | Weigeringsscherm met neutrale melding; één nieuwe rij met access_granted = false                                                   | AC-01.5          |
| 3   | Gegeven een niet-bestaand lidnummer, wanneer er wordt ingecheckt, dan wordt toegang geweigerd zonder dat er een logregel ontstaat                                             | lidnummer 999                | Exact dezelfde melding als bij test 2, dus niet af te leiden of het lidnummer bestaat; geen nieuwe rij in visit_logs               | AC-01.5          |
| 4   | Gegeven een lid dat zijn weeklimiet heeft bereikt, wanneer het lid incheckt, dan wordt toegang geweigerd met de bezoeklimiet als reden                                        | M2 (2 van 2)                 | Weigeringsscherm met limiet als reden; geen toegangsrij toegevoegd                                                                 | AC-01.2          |
| 5   | Gegeven een lid met precies één bezoek onder zijn limiet, wanneer het lid incheckt, dan wordt toegang verleend                                                                | M3 (1 van 2)                 | Toegang verleend; grensgeval net onder de limiet                                                                                   | AC-01.3          |
| 6   | Gegeven een lid met een onbeperkt abonnement, wanneer het lid voor de vierde keer deze week incheckt, dan wordt toegang verleend                                              | M4 (subscription_limit NULL) | Toegang verleend; NULL wordt als onbeperkt gelezen, niet als limiet 0                                                              | AC-01.4          |
| 7   | Gegeven een lid dat vorige week zijn limiet volmaakte maar deze week nog niet is geweest, wanneer het lid incheckt, dan wordt toegang verleend                                | M5                           | Toegang verleend; bezoeken van vóór afgelopen maandag tellen niet mee, die van deze week wel                                       | AC-01.1          |

abonnement.cy.ts

| #   | Scenario                                                                                                                                                           | Testdata                       | Verwacht resultaat                                                                                                                                                                                           |                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| 8   | Gegeven een ingelogd lid op het abonnementsoverzicht, wanneer het lid opzegt en bevestigt, dan is het abonnement opgezegd tot het einde van de huidige maandcyclus | M1, startdatum 5e van de maand | Volgorde overzicht → bevestigen → opgezegd; op het bevestigscherm staat "er wordt nog niets gewijzigd totdat je bevestigt"; subscription_end is de eerstvolgende 5e; het bevestigingsbericht toont die datum | AC-02.1, AC-02.2, AC-02.3, AC-02.4 |
| 9   | Gegeven een lid op het bevestigingsscherm, wanneer het lid terugkeert zonder te bevestigen, dan is er niets gewijzigd                                              | M1                             | subscription_end blijft NULL; de opzegknop is nog zichtbaar                                                                                                                                                  | AC-02.1, AC-02.2                   |
| 10  | Gegeven een lid dat opzegt op de verlengdag zelf, wanneer het opzeggen is bevestigd, dan krijgt het lid een volledige extra cyclus                                 | M8                             | Einddatum ligt een maand verderop. Bekende keuze, geen bug; zie hoofdstuk 6                                                                                                                                  | AC-02.3                            |
| 11  | Gegeven een al opgezegd abonnement, wanneer het lid het overzicht opent, dan is opnieuw opzeggen niet mogelijk                                                     | M6                             | Opzegknop ontbreekt; de bestaande einddatum wordt getoond en wordt niet verzet (al_opgezegd-guard)                                                                                                           | AC-02.1, AC-02.4                   |

integratie.cy.ts

| #   | Scenario                                                                                                                                  | Testdata | Verwacht resultaat                                                     |                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- | ---------------- |
| 12  | Gegeven een lid dat heeft opgezegd maar waarvan de einddatum nog niet is verstreken, wanneer het lid incheckt, dan wordt toegang verleend | M6       | Toegang verleend; opzeggen maakt het lidmaatschap niet direct ongeldig | AC-02.3, AC-01.3 |
| 13  | Gegeven een lid waarvan de einddatum is verstreken, wanneer het lid incheckt, dan wordt toegang geweigerd                                 | M7       | Weigering met de reden dat het abonnement is beëindigd                 | AC-02.3          |

beheer.cy.ts

| #   | Scenario                                                                                                                                              | Testdata                  | Verwacht resultaat                                                                                                                 |       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 14  | Gegeven bezoeklogs van 21 dagen en van vandaag, wanneer een medewerker het anonimiseren bevestigt, dan is alleen de oude log losgekoppeld van het lid | Seedlogs                  | Oude log: user_id NULL, subscription_type_id blijft staan, tabel toont "Anoniem". Log van vandaag: ongewijzigd, naam nog zichtbaar | NF-03 |
| 15  | Gegeven dat er geen logs ouder dan 14 dagen zijn, wanneer het beheerscherm wordt geopend, dan is de anonimiseerknop zichtbaar maar inactief           | database zonder oude logs | Knop grijs en niet aanklikbaar in plaats van verdwenen                                                                             | NF-03 |

## 5. Testcases

De scenario's uit hoofdstuk 4 zijn hieronder uitgewerkt tot uitvoerbare testcases. Elke case heeft een preconditie, genummerde stappen en een verwacht resultaat. De kolommen Werkelijk resultaat en Status blijven leeg tot de uitvoering en worden ingevuld in het testrapport.

Voor alle cases geldt dezelfde algemene preconditie: de applicatie draait lokaal, de testdatabase is leeg en opnieuw gevuld via cy.task("seed"), en de datums in de seed zijn berekend ten opzichte van de uitvoerdatum.

### TC-01 | Geldige incheck wordt toegekend en gelogd

| Test case ID: TC-01                                                                                                                                                           | Prioriteit: Hoog                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M1 bestaat (Basic, limiet 2 per week), heeft 0 bezoeken deze week en is niet opgezegd. De juiste pincode is bekend.                                            | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Geldige incheck wordt toegekend en gelogd                                                                                                                    | Test uitgevoerd op: -              |
| Test case description: Controle of een geslaagde incheckpoging toegang geeft en correct wordt vastgelegd in visit_logs met de juiste user_id, abonnementstype en status true. | Test status: -                     |
| Acceptatiecriterium: AC-01.3, AC-01.5                                                                                                                                         |                                    |

| Stap # | Test stap                                             | Verwacht resultaat                                                                                           | Test data                                               | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Ga naar het incheckscherm                             | Het formulier met lidnummer en pincode wordt zonder fouten weergegeven                                       | URL: http://localhost:3000/                             |                     |                          |
| 2      | Vul het lidnummer en de juiste pincode in en bevestig | Welkomstscherm met de naam van het lid                                                                       | lidnummer = M1, pincode = juiste pincode                |                     |                          |
| 3      | Controleer de database op een nieuwe logregel         | Eén nieuw record met user_id van M1, actuele timestamp, gevuld subscription_type_id en access_granted = true | SQL: SELECT * FROM visit_logs ORDER BY id DESC LIMIT 5; |                     |                          |
| 4      | Wacht tot de aftelbalk is afgelopen                   | Het scherm keert automatisch terug naar het incheckformulier                                                 | wachttijd = 10 seconden                                 |                     |                          |

### TC-02 | Onjuiste pincode wordt geweigerd en gelogd

| Test case ID: TC-02                                                                                                                                           | Prioriteit: Hoog                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M1 bestaat en de juiste pincode is bekend, zodat er bewust een andere pincode kan worden ingevoerd.                                            | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Onjuiste pincode wordt geweigerd en gelogd                                                                                                   | Test uitgevoerd op: -              |
| Test case description: Controle of een incheckpoging met een verkeerde pincode wordt geweigerd met een neutrale melding en wordt vastgelegd met status false. | Test status: -                     |
| Acceptatiecriterium: AC-01.5                                                                                                                                  |                                    |

| Stap # | Test stap                                                        | Verwacht resultaat                                                                     | Test data                                               | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Vul het lidnummer van M1 in met een onjuiste pincode en bevestig | Weigeringsscherm met een neutrale melding die niet prijsgeeft of het lidnummer bestaat | lidnummer = M1, pincode = 0000 (onjuist)                |                     |                          |
| 2      | Noteer de exacte tekst van de melding                            | Tekst vastgelegd voor vergelijking met TC-03                                           | n.v.t.                                                  |                     |                          |
| 3      | Controleer de database op een nieuwe logregel                    | Eén nieuw record met user_id van M1 en access_granted = false                          | SQL: SELECT * FROM visit_logs ORDER BY id DESC LIMIT 5; |                     |                          |

### TC-03 | Onbekend lidnummer geeft dezelfde melding en geen logregel

| Test case ID: TC-03                                                                                                                                                   | Prioriteit: Midden                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: Lidnummer 999 bestaat niet in de database. TC-02 is uitgevoerd en de meldingtekst daarvan is genoteerd.                                                | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Onbekend lidnummer geeft dezelfde melding en geen logregel                                                                                           | Test uitgevoerd op: -              |
| Test case description: Controle of een niet-bestaand lidnummer dezelfde weigermelding oplevert als een foute pincode, en of er bewust geen logregel wordt aangemaakt. | Test status: -                     |
| Acceptatiecriterium: AC-01.5 (met onderbouwde afwijking, zie hoofdstuk 7)                                                                                             |                                    |

| Stap # | Test stap                                                     | Verwacht resultaat                                     | Test data                             | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------- | ------------------- | ------------------------ |
| 1      | Tel het aantal records in visit_logs                          | Aantal genoteerd als beginstand                        | SQL: SELECT COUNT(*) FROM visit_logs; |                     |                          |
| 2      | Vul lidnummer 999 met een willekeurige pincode in en bevestig | Weigeringsscherm met exact dezelfde tekst als in TC-02 | lidnummer = 999, pincode = 1234       |                     |                          |
| 3      | Tel het aantal records opnieuw                                | Aantal is ongewijzigd ten opzichte van stap 1          | SQL: SELECT COUNT(*) FROM visit_logs; |                     |                          |

### TC-04 | Bereikte bezoeklimiet wordt geweigerd met de voorgeschreven melding

| Test case ID: TC-04                                                                                                                                     | Prioriteit: Hoog                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M2 bestaat (Basic, limiet 2 per week) en heeft deze week al 2 bezoeken geregistreerd.                                                    | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Bereikte bezoeklimiet wordt geweigerd met de voorgeschreven melding                                                                    | Test uitgevoerd op: -              |
| Test case description: Controle of een lid dat zijn weeklimiet heeft bereikt toegang wordt geweigerd met de exacte melding uit het acceptatiecriterium. | Test status: -                     |
| Acceptatiecriterium: AC-01.2                                                                                                                            |                                    |

| Stap # | Test stap                                                          | Verwacht resultaat                                                               | Test data                                               | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Check in met het lidnummer en de juiste pincode van M2             | Weigeringsscherm met de tekst: Je hebt je bezoeklimiet al bereikt voor deze week | lidnummer = M2, pincode = juiste pincode                |                     |                          |
| 2      | Controleer of het scherm vermeldt wanneer het lid weer terecht kan | De verwijzing naar het volgende geldige moment is zichtbaar                      | n.v.t.                                                  |                     |                          |
| 3      | Controleer de database                                             | Eén nieuw record met access_granted = false; geen record met true                | SQL: SELECT * FROM visit_logs ORDER BY id DESC LIMIT 5; |                     |                          |

### TC-05 | Eén bezoek onder de limiet geeft toegang

| Test case ID: TC-05                                                                                                                | Prioriteit: Midden                 |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M3 bestaat (Basic, limiet 2 per week) en heeft deze week 1 bezoek geregistreerd.                                    | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Eén bezoek onder de limiet geeft toegang                                                                          | Test uitgevoerd op: -              |
| Test case description: Controle van het grensgeval net onder de bezoeklimiet, en of de teller daarna correct op de limiet uitkomt. | Test status: -                     |
| Acceptatiecriterium: AC-01.3                                                                                                       |                                    |

| Stap # | Test stap                              | Verwacht resultaat                                             | Test data                                | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- | ------------------- | ------------------------ |
| 1      | Check in met de juiste gegevens van M3 | Toegang verleend met welkomstmelding                           | lidnummer = M3, pincode = juiste pincode |                     |                          |
| 2      | Check direct daarna nogmaals in met M3 | Weigering wegens bereikte limiet, want de teller staat nu op 2 | lidnummer = M3, pincode = juiste pincode |                     |                          |

### TC-06 | Onbeperkt abonnement krijgt nooit een weigermelding

| Test case ID: TC-06                                                                                                                               | Prioriteit: Midden                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M4 bestaat met een Premium-abonnement waarbij subscription_limit NULL is, en heeft deze week 3 bezoeken.                           | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Onbeperkt abonnement krijgt nooit een weigermelding                                                                              | Test uitgevoerd op: -              |
| Test case description: Controle of een abonnement zonder bezoeklimiet (subscription_limit NULL) als onbeperkt wordt gelezen en niet als limiet 0. | Test status: -                     |
| Acceptatiecriterium: AC-01.4                                                                                                                      |                                    |

| Stap # | Test stap                                                 | Verwacht resultaat                                  | Test data                                | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- | ------------------- | ------------------------ |
| 1      | Check in met de juiste gegevens van M4                    | Toegang verleend met welkomstmelding                | lidnummer = M4, pincode = juiste pincode |                     |                          |
| 2      | Controleer het scherm op een weigermelding of limiettekst | Geen enkele weigermelding of limiettekst zichtbaar  | n.v.t.                                   |                     |                          |
| 3      | Controleer het abonnementstype in de database             | subscription_limit is NULL voor dit abonnementstype | SQL: SELECT * FROM subscription_types;   |                     |                          |

### TC-07 | De bezoekteller reset op maandag

| Test case ID: TC-07                                                                                                                                                    | Prioriteit: Hoog                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M5 bestaat (Basic, limiet 2 per week) met 2 bezoeken van vóór afgelopen maandag en 0 bezoeken daarna. De seeddatums zijn relatief aan vandaag berekend. | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: De bezoekteller reset op maandag                                                                                                                      | Test uitgevoerd op: -              |
| Test case description: Controle of bezoeken van vóór afgelopen maandag niet meetellen voor de weeklimiet en bezoeken van deze week wél.                                | Test status: -                     |
| Acceptatiecriterium: AC-01.1                                                                                                                                           |                                    |

| Stap # | Test stap                              | Verwacht resultaat                                                         | Test data                                | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------- | ------------------- | ------------------------ |
| 1      | Check in met de juiste gegevens van M5 | Toegang verleend; de bezoeken van vorige week tellen niet mee              | lidnummer = M5, pincode = juiste pincode |                     |                          |
| 2      | Check een tweede keer in met M5        | Toegang verleend; dit is het tweede bezoek van deze week                   | lidnummer = M5, pincode = juiste pincode |                     |                          |
| 3      | Check een derde keer in met M5         | Weigering wegens bereikte limiet; de bezoeken van deze week tellen wél mee | lidnummer = M5, pincode = juiste pincode |                     |                          |

### TC-08 | Volledige opzegflow met correcte einddatum

| Test case ID: TC-08                                                                                                                                           | Prioriteit: Hoog                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M1 bestaat met startdatum op de 5e van de maand en subscription_end NULL.                                                                      | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Volledige opzegflow met correcte einddatum                                                                                                   | Test uitgevoerd op: -              |
| Test case description: Controle of het opzeggen pas na expliciete bevestiging wordt verwerkt en of de einddatum op de eerstvolgende verlengdatum wordt gezet. | Test status: -                     |
| Acceptatiecriterium: AC-02.1, AC-02.2, AC-02.3, AC-02.4                                                                                                       |                                    |

| Stap # | Test stap                                                       | Verwacht resultaat                                                                   | Test data                                              | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------- | ------------------------ |
| 1      | Log in op het abonnementsscherm met lidnummer en pincode van M1 | Het overzicht toont het abonnementstype en de status actief                          | URL: http://localhost:3000/abonnement, lidnummer = M1  |                     |                          |
| 2      | Klik op opzeggen                                                | Bevestigingsscherm met de tekst dat er nog niets wordt gewijzigd totdat je bevestigt | n.v.t.                                                 |                     |                          |
| 3      | Controleer de database vóór bevestiging                         | subscription_end is nog steeds NULL                                                  | SQL: SELECT subscription_end FROM users WHERE id = M1; |                     |                          |
| 4      | Bevestig de opzegging                                           | Bevestigingsbericht met de datum tot wanneer de toegang geldig blijft                | n.v.t.                                                 |                     |                          |
| 5      | Controleer de database na bevestiging                           | subscription_end is gevuld met de eerstvolgende 5e van de maand                      | SQL: SELECT subscription_end FROM users WHERE id = M1; |                     |                          |

### TC-09 | Terugkeren zonder bevestigen wijzigt niets

| Test case ID: TC-09                                                                                                              | Prioriteit: Hoog                   |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M1 bestaat met subscription_end NULL.                                                                             | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Terugkeren zonder bevestigen wijzigt niets                                                                      | Test uitgevoerd op: -              |
| Test case description: Controle of het verlaten van het bevestigingsscherm zonder submit het abonnement ongewijzigd actief laat. | Test status: -                     |
| Acceptatiecriterium: AC-02.1, AC-02.2                                                                                            |                                    |

| Stap # | Test stap                                          | Verwacht resultaat                                                    | Test data                                              | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ | ------------------- | ------------------------ |
| 1      | Log in en klik op opzeggen                         | Het bevestigingsscherm verschijnt                                     | URL: http://localhost:3000/abonnement, lidnummer = M1  |                     |                          |
| 2      | Keer terug naar het overzicht zonder te bevestigen | Het overzicht toont de status actief en de opzegknop is nog zichtbaar | n.v.t.                                                 |                     |                          |
| 3      | Controleer de database                             | subscription_end is nog steeds NULL                                   | SQL: SELECT subscription_end FROM users WHERE id = M1; |                     |                          |

### TC-10 | Opzeggen op de verlengdag zelf geeft een extra cyclus

| Test case ID: TC-10                                                                                                                                   | Prioriteit: Laag                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M8 bestaat met een startdatum op dezelfde dag-van-de-maand als vandaag en subscription_end NULL.                                       | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Opzeggen op de verlengdag zelf geeft een extra cyclus                                                                                | Test uitgevoerd op: -              |
| Test case description: Controle van het grensgeval waarbij de opzegdatum gelijk is aan de verlengdag. Bekend en geaccepteerd gedrag, zie hoofdstuk 7. | Test status: -                     |
| Acceptatiecriterium: AC-02.3                                                                                                                          |                                    |

| Stap # | Test stap                              | Verwacht resultaat                                    | Test data                                              | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ | ------------------- | ------------------------ |
| 1      | Log in, zeg op en bevestig             | Bevestigingsbericht met een einddatum                 | URL: http://localhost:3000/abonnement, lidnummer = M8  |                     |                          |
| 2      | Controleer de einddatum in de database | subscription_end ligt een maand vooruit, niet vandaag | SQL: SELECT subscription_end FROM users WHERE id = M8; |                     |                          |

### TC-11 | Een al opgezegd abonnement kan niet opnieuw worden opgezegd

| Test case ID: TC-11                                                                                            | Prioriteit: Midden                 |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M6 bestaat, is opgezegd en heeft een subscription_end in de toekomst.                           | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Een al opgezegd abonnement kan niet opnieuw worden opgezegd                                   | Test uitgevoerd op: -              |
| Test case description: Controle of de al_opgezegd-guard voorkomt dat een tweede opzegging de einddatum verzet. | Test status: -                     |
| Acceptatiecriterium: AC-02.1, AC-02.4                                                                          |                                    |

| Stap # | Test stap                              | Verwacht resultaat                                                              | Test data                                              | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------- | ------------------------ |
| 1      | Noteer de huidige einddatum van M6     | Waarde genoteerd als beginstand                                                 | SQL: SELECT subscription_end FROM users WHERE id = M6; |                     |                          |
| 2      | Log in op het abonnementsscherm met M6 | Het overzicht toont de status opgezegd met de einddatum; de opzegknop ontbreekt | URL: http://localhost:3000/abonnement, lidnummer = M6  |                     |                          |
| 3      | Controleer de einddatum opnieuw        | Ongewijzigd ten opzichte van stap 1                                             | SQL: SELECT subscription_end FROM users WHERE id = M6; |                     |                          |

### TC-12 | Opgezegd lid houdt toegang tot de einddatum

| Test case ID: TC-12                                                                                                  | Prioriteit: Hoog                   |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M6 bestaat, is opgezegd, heeft een subscription_end in de toekomst en 0 bezoeken deze week.           | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Opgezegd lid houdt toegang tot de einddatum                                                         | Test uitgevoerd op: -              |
| Test case description: Integratiecontrole tussen US-01 en US-02: een opzegging mag de toegang niet direct blokkeren. | Test status: -                     |
| Acceptatiecriterium: AC-02.3, AC-01.3                                                                                |                                    |

| Stap # | Test stap                              | Verwacht resultaat                     | Test data                                               | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | -------------------------------------- | ------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Check in met de juiste gegevens van M6 | Toegang verleend met welkomstmelding   | lidnummer = M6, pincode = juiste pincode                |                     |                          |
| 2      | Controleer de database                 | Nieuw record met access_granted = true | SQL: SELECT * FROM visit_logs ORDER BY id DESC LIMIT 5; |                     |                          |

### TC-13 | Na de einddatum wordt toegang geweigerd

| Test case ID: TC-13                                                                                                                           | Prioriteit: Hoog                   |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: M7 bestaat, is opgezegd en heeft een subscription_end in het verleden.                                                         | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Na de einddatum wordt toegang geweigerd                                                                                      | Test uitgevoerd op: -              |
| Test case description: Integratiecontrole tussen US-01 en US-02: na het verstrijken van de einddatum vervalt de toegang, met de juiste reden. | Test status: -                     |
| Acceptatiecriterium: AC-02.3                                                                                                                  |                                    |

| Stap # | Test stap                              | Verwacht resultaat                                                                       | Test data                                               | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Check in met de juiste gegevens van M7 | Weigering met als reden dat het abonnement is beëindigd, niet met de bezoeklimietmelding | lidnummer = M7, pincode = juiste pincode                |                     |                          |
| 2      | Controleer de database                 | Nieuw record met access_granted = false                                                  | SQL: SELECT * FROM visit_logs ORDER BY id DESC LIMIT 5; |                     |                          |

### TC-14 | Anonimiseren raakt alleen logs ouder dan 14 dagen

| Test case ID: TC-14                                                                                                                                       | Prioriteit: Hoog                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: De seed bevat een bezoeklog van 21 dagen oud met gevulde user_id en een bezoeklog van vandaag met gevulde user_id.                         | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Anonimiseren raakt alleen logs ouder dan 14 dagen                                                                                        | Test uitgevoerd op: -              |
| Test case description: Controle of het anonimiseren de koppeling met het lid verwijdert bij oude logs en recente logs ongemoeid laat, conform de AVG-eis. | Test status: -                     |
| Acceptatiecriterium: NF-03                                                                                                                                |                                    |

| Stap # | Test stap                               | Verwacht resultaat                                                                            | Test data                                                                                      | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | --------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open het beheerscherm                   | De tabel toont beide logs met de naam van het lid; de anonimiseerknop is actief               | URL: http://localhost:3000/beheer                                                              |                     |                          |
| 2      | Start het anonimiseren en bevestig      | Bevestiging dat de logs ouder dan 14 dagen zijn geanonimiseerd                                | n.v.t.                                                                                         |                     |                          |
| 3      | Bekijk de tabel opnieuw                 | De log van 21 dagen oud toont Anoniem; de log van vandaag toont nog de naam                   | n.v.t.                                                                                         |                     |                          |
| 4      | Controleer beide records in de database | Oude log: user_id is NULL en subscription_type_id is nog gevuld. Log van vandaag: ongewijzigd | SQL: SELECT id, user_id, subscription_type_id, created_at FROM visit_logs ORDER BY created_at; |                     |                          |

### TC-15 | Knop is inactief als er niets te anonimiseren valt

| Test case ID: TC-15                                                                                       | Prioriteit: Laag                   |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Pre-condition: De database bevat geen bezoeklogs ouder dan 14 dagen.                                      | Test uitgevoerd door: Ahmad Alasmi |
| Test case title: Knop is inactief als er niets te anonimiseren valt                                       | Test uitgevoerd op: -              |
| Test case description: Controle van de UI-toestand wanneer er geen logs ouder dan 14 dagen aanwezig zijn. | Test status: -                     |
| Acceptatiecriterium: NF-03                                                                                |                                    |

| Stap # | Test stap                     | Verwacht resultaat                                             | Test data                                                   | Werkelijk resultaat | Geslaagd / niet geslaagd |
| ------ | ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | ------------------- | ------------------------ |
| 1      | Open het beheerscherm         | De anonimiseerknop is zichtbaar maar grijs en niet aanklikbaar | URL: http://localhost:3000/beheer                           |                     |                          |
| 2      | Probeer op de knop te klikken | Er gebeurt niets en er verandert niets in de database          | SQL: SELECT COUNT(*) FROM visit_logs WHERE user_id IS NULL; |                     |                          |

## 6. Dekking en risicoverdeling

Elk van de negen acceptatiecriteria wordt door minimaal één test geraakt, en van elk criterium wordt zowel het hoofdpad als minimaal één alternatief pad getest.

| Risicotype                           | Tests    |
| ------------------------------------ | -------- |
| Happy path                           | 1, 8     |
| Foutafhandeling                      | 2, 3     |
| Businessregel                        | 4, 7, 14 |
| Grensgeval                           | 5, 6, 10 |
| Guard tegen ongewenste datawijziging | 9, 11    |
| Integratie tussen user stories       | 12, 13   |
| UI-toestand                          | 15       |

## 7. Bekende beperkingen

Deze punten worden niet als testfout gerapporteerd, maar als onderbouwde bevinding in het testrapport opgenomen:

- Onbekend lidnummer levert geen logregel op, terwijl AC-01.5 spreekt over "elke poging". Zonder identiteit en abonnementstype zou de rij alleen ruis zijn en tegelijk gegevens vastleggen over een niet-geïdentificeerd persoon. Bewuste privacy-afweging; getest in test 3.
- Klemmen bij korte maanden is niet getest. Een lid met startdatum op de 31e dat in januari opzegt, hoort een einddatum van 28 of 29 februari te krijgen. Om dat E2E te toetsen moet de systeemdatum verzet worden, wat via de browser niet kan zonder een testhook in productiecode te bouwen. Geaccepteerd risico, opgenomen als verbetervoorstel.
- Opzeggen op de verlengdag zelf geeft een volledige extra cyclus (verleng.getTime() <= vandaag telt de dag zelf als verstreken). Een keuze, geen bug; getest in test 10 en als zodanig vastgelegd.
- Een mislukte inlogpoging op /abonnement wordt nergens vastgelegd, terwijl inchecken dat wel doet. visit_logs gaat over bezoeken, niet over accountlogins. Verdedigbaar, maar dat hoort expliciet benoemd te worden.
- Geen rem op herhaald pincode-raden op beide schermen. Bekende beperking, op te nemen als verbetervoorstel.
- /beheer is niet afgeschermd met een medewerkersrol. Bewust buiten de scope van de kernflow gelaten.

## 8. Exitcriteria

De testfase is afgerond wanneer:

- alle vijftien testcases zijn uitgevoerd en van een werkelijk resultaat en status zijn voorzien;
- elk van de negen acceptatiecriteria minimaal één geslaagde test heeft;
- elke afwijking is voorzien van een conclusie: opgelost, geaccepteerd met onderbouwing, of doorgeschoven als verbetervoorstel;
- het testrapport is opgeleverd.
