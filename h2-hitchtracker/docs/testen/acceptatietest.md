# Acceptatietest HitchTracker

|                |     |
| -------------- | --- |
| Naam Tester    |     |
| Leerlingnummer |     |
| Datum          |     |
| Versie         | V1  |

De tester vult de kolommen Werkelijk resultaat, Aanpassingen, Uren en Door in.
Prioriteit: 1 = laag, 2 = middel, 3 = hoog.
Tussen haakjes staat bij elk scenario de testcase uit het testplan (`docs/testen/testplan.md`).

## Instructie voor de testpersoon

De testpersoon is iemand die de app niet heeft gebouwd en de code niet kent. De testpersoon krijgt alleen de laptop met de app op het startscherm en deze opdracht:

> Je staat op Centraal Station in Amsterdam en wilt met de taxi naar Schiphol. Zoek uit wat de rit ongeveer kost en hoe lang hij duurt. Accepteer de schatting. Rond daarna de rit af met de demoknop en bekijk wat je uiteindelijk betaalt.

De tester (de student) leest de scenario's hieronder één voor één voor, kijkt mee en vult de tabellen in. De tester helpt alleen als de testpersoon vastloopt en noteert dat dan bij Aanpassingen.

Vooraf: schone start van de database (zie hoofdstuk 3 van het testplan), Chrome op een laptop, venster 1280 × 800, app op `http://localhost:3000`.

## US-01 Ritschatting vooraf

### 1. Een schatting opvragen

| Actie              | Scenario                                                                              | Verwacht resultaat                                                                                                                                              | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| ------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Schatting opvragen | De reiziger kiest Centraal Station als vertrekpunt en Schiphol als bestemming (TC-04) | De reiziger ziet "Centraal Station → Schiphol", de prijs `± € 53,80` en `ca. 25 minuten · 17 km`                                                                |                     |              |      | 3          |      |
| Tarief bekijken    | De reiziger zoekt op het schattingsscherm op welk tarief er is gebruikt (TC-06)       | Het blok "Gebruikt tarief (Amsterdam)" toont Starttarief € 3,00, Per km € 2,40 en Per minuut € 0,40, met de tekst "De eindprijs wordt met dit tarief berekend." |                     |              |      | 3          |      |

### 2. Er is geen schatting mogelijk

| Actie              | Scenario                                                                                   | Verwacht resultaat                                                                                                                                        | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| ------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Schatting opvragen | De reiziger klikt op "Schatting opvragen" zonder iets te kiezen (TC-01)                    | De reiziger ziet "Kies een vertrekpunt en een bestemming." en beide keuzevelden krijgen een rode rand; er verschijnt geen schatting                       |                     |              |      | 3          |      |
| Schatting opvragen | De reiziger kiest alleen een vertrekpunt en klikt op "Schatting opvragen" (TC-02)          | De reiziger ziet "Kies een vertrekpunt en een bestemming."; er verschijnt geen schatting                                                                  |                     |              |      | 2          |      |
| Schatting opvragen | De reiziger kiest Rotterdam Centraal als vertrekpunt en Erasmusbrug als bestemming (TC-11) | De reiziger ziet "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk." en de knop is grijs; na een andere keuze is de knop weer blauw |                     |              |      | 3          |      |

## US-02 Eindprijs controleren

### 3. Een normale rit afronden

| Actie             | Scenario                                                                                                    | Verwacht resultaat                                                                                            | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Rit afronden      | De reiziger accepteert de schatting Centraal Station → Schiphol en klikt op "Rit afronden: normaal" (TC-13) | De reiziger ziet "Rit afgerond" met Eindprijs € 56,34, Gereden afstand 17,9 km en Ritduur 26 min              |                     |              |      | 3          |      |
| Verschil bekijken | De reiziger vergelijkt de eindprijs met de schatting (TC-19)                                                | Schatting € 53,80 en Eindprijs € 56,34 staan naast elkaar; het verschil is "+ € 2,54 (+5%)"                   |                     |              |      | 3          |      |
| Verschil bekijken | De reiziger kijkt of er een waarschuwing staat (TC-24)                                                      | Er staat geen waarschuwing; wel "Deze prijs is berekend door HitchTracker, niet ingevoerd door de chauffeur." |                     |              |      | 3          |      |
| Rit terugvinden   | De reiziger heeft de ritlink gekopieerd, sluit het tabblad en opent de link in een nieuw tabblad (TC-14)    | De reiziger ziet hetzelfde eindprijsscherm; het demoblok is weg                                               |                     |              |      | 2          |      |

### 4. Een rit met een omweg afronden

| Actie              | Scenario                                                                                                           | Verwacht resultaat                                                                                                                                         | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Rit afronden       | De reiziger plant een nieuwe rit Centraal Station → Schiphol, accepteert en klikt op "Rit afronden: omweg" (TC-20) | De reiziger ziet Eindprijs € 67,00, Gereden afstand 21,3 km, Ritduur 33 min en het verschil "+ € 13,20 (+25%)"                                             |                     |              |      | 2          |      |
| Waarschuwing lezen | De reiziger kijkt of er een waarschuwing staat en wat die zegt (TC-23)                                             | Er staat een oranje waarschuwing: "De eindprijs is meer dan 20% hoger dan de schatting. Vraag de chauffeur om uitleg, bijvoorbeeld over de gereden route." |                     |              |      | 3          |      |

## Usability-vragen

Na de scenario's beantwoordt de testpersoon deze vragen met een cijfer van 1 (helemaal niet) tot 5 (helemaal wel) en een korte toelichting. De tester schrijft de antwoorden op.

| #   | Vraag                                                                             | Cijfer (1–5) | Toelichting |
| --- | --------------------------------------------------------------------------------- | ------------ | ----------- |
| 1   | Was meteen duidelijk wat de rit ongeveer kost en hoe lang hij duurt?              |              |             |
| 2   | Begreep je welk tarief er is gebruikt?                                            |              |             |
| 3   | Was duidelijk dat de rit pas wordt opgeslagen als je de schatting accepteert?     |              |             |
| 4   | Begreep je het verschil tussen de schatting en de eindprijs?                      |              |             |
| 5   | Was de waarschuwing duidelijk, en vond je de toon eerlijk tegenover de chauffeur? |              |             |
| 6   | Was het duidelijk waarom je wel of geen waarschuwing kreeg?                       |              |             |
| 7   | Wat zou je veranderen?                                                            | n.v.t.       |             |
