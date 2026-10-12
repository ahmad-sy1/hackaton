# Gebruikershandleiding HitchTracker

Deze handleiding legt uit hoe je HitchTracker gebruikt als **reiziger**. Vóór de rit zie je wat
een taxirit ongeveer kost en hoe lang hij duurt. Na de rit zie je de eindprijs naast die
schatting, zodat je kunt controleren of je niet te veel betaalt.

Je opent HitchTracker in de browser op een laptop. Linksboven staat **HitchTracker**; daarmee ga
je altijd terug naar het startscherm.

## Een schatting opvragen

1. Op het startscherm staat "Waar wil je naartoe?".
2. Kies bij **Vertrekpunt** waar je instapt. Je kiest uit vaste ophaalpunten, gegroepeerd per stad.
3. Kies bij **Bestemming** waar je heen wilt. Je vertrekpunt staat niet in deze lijst.
4. Druk op **Schatting opvragen**. Op de knop staat even "Bezig…".

Je ziet daarna de schatting. Krijg je een melding, kijk dan bij [Meldingen](#meldingen).

## De schatting lezen

Bovenaan staat je rit, bijvoorbeeld "Centraal Station → Schiphol". Daaronder staat:

- **Verwachte prijs**, bijvoorbeeld "± € 53,80". Het "±" betekent dat het een schatting is.
- De verwachte reistijd en afstand, bijvoorbeeld "ca. 25 minuten · 17 km".

Rechts staat het blok **Gebruikt tarief (Amsterdam)**. Daarin zie je hoe de prijs is opgebouwd:

| Regel       | Bedrag (Amsterdam) | Betekenis                   |
| ----------- | ------------------ | --------------------------- |
| Starttarief | € 3,00             | Vast bedrag voor elke rit   |
| Per km      | € 2,40             | Per gereden kilometer       |
| Per minuut  | € 0,40             | Per minuut dat de rit duurt |

Voorbeeld: 17 km en 25 minuten is € 3,00 + 17 × € 2,40 + 25 × € 0,40 = € 53,80.

Onder het blok staat "De eindprijs wordt met dit tarief berekend." Ook als het tarief later
verandert, wordt jouw eindprijs met dit tarief berekend.

## De schatting accepteren of teruggaan

- Druk op **Schatting accepteren** als je de rit wilt maken. Pas dan wordt je rit vastgelegd.
- Druk op **Terug** als je de rit niet wilt maken. Er wordt dan **niets opgeslagen**. Je komt
  terug op het startscherm.

## De ritlink bewaren

Na het accepteren zie je het scherm **Rit is bezig**, met je rit en de **Vastgelegde schatting**.

Rechts staat "Bewaar deze link om je rit later terug te vinden." met daaronder je persoonlijke
ritlink.

1. Druk op **Kopiëren**. Op de knop staat daarna "Gekopieerd".
2. Bewaar de link, bijvoorbeeld in een notitie of een bericht aan jezelf.

Met deze link open je later je rit opnieuw, ook in een ander tabblad of nadat je de browser hebt
gesloten. Er is geen account: wie de link heeft, kan de rit bekijken. Deel hem dus niet met
anderen. De link is niet te raden.

Lukt kopiëren niet? Dan blijft de link op het scherm staan en kun je hem met de hand selecteren
en kopiëren.

Je ritgegevens worden **na 30 dagen verwijderd**. Daarna werkt de link niet meer.

## De rit afronden met de demoknop

In het echt rondt de chauffeur de rit af. In deze versie is er nog geen koppeling met de
taximeter. Daarom staat onderaan het gestippelde demoblok, met twee knoppen die de chauffeur
nabootsen:

- **Rit afronden: normaal (simulatie chauffeur)**: een rit die iets langer was dan geschat.
- **Rit afronden: omweg (simulatie chauffeur)**: een rit met een omweg, die duidelijk duurder is.

Het demoblok is alleen bedoeld om de app te testen en te demonstreren. Druk op één van de twee
knoppen. Je ziet daarna op dezelfde link het scherm **Rit afgerond**.

Je kunt de eindprijs nergens zelf invullen, en de chauffeur ook niet: HitchTracker berekent hem.
Een rit kan maar één keer worden afgerond. Is de rit al afgerond, dan blijft de eerste eindprijs
staan.

## De eindprijs en het verschil lezen

Op het scherm **Rit afgerond** staat:

| Wat je ziet         | Wat het betekent                                                          |
| ------------------- | ------------------------------------------------------------------------- |
| **Schatting**       | De prijs die je vóór de rit hebt geaccepteerd                             |
| **Eindprijs**       | Wat de rit werkelijk kost, berekend met hetzelfde tarief als de schatting |
| **Gereden afstand** | Hoeveel kilometer er werkelijk is gereden                                 |
| **Ritduur**         | Hoe lang de rit werkelijk duurde                                          |
| **Verschil**        | Hoeveel de eindprijs afwijkt van de schatting, in euro's en in procenten  |

Voorbeelden van het verschil:

- "+ € 2,54 (+5%)": de rit was € 2,54 duurder dan geschat, dat is 5% meer.
- "− € 0,02 (−0%)": de rit was 2 cent goedkoper dan geschat. Het percentage is afgerond, dus het
  minteken laat zien dat de rit goedkoper was.

Rechts staat "Deze prijs is berekend door HitchTracker, niet ingevoerd door de chauffeur."

Met **Nieuwe rit** ga je terug naar het startscherm.

## Wanneer krijg je een waarschuwing?

Is de eindprijs **meer dan 20% hoger** dan de schatting, dan zie je een oranje blok:

> ⚠ **De eindprijs is meer dan 20% hoger dan de schatting.** Vraag de chauffeur om uitleg,
> bijvoorbeeld over de gereden route.

De regel **Verschil** is dan ook oranje.

**Wat doe je dan?** Vraag de chauffeur waarom de rit zoveel duurder is, bijvoorbeeld welke route
er is gereden. Vergelijk de **Gereden afstand** en de **Ritduur** met de schatting. Een omweg of
file kan een verklaring zijn.

**Waarom krijg ik bij "+20%" soms geen waarschuwing?** De waarschuwing komt alleen bij **meer
dan** 20%. Precies 20% hoger is niet meer dan 20%, dus dan komt er geen waarschuwing.
HitchTracker rekent die grens precies na, op de cent. Het percentage op het scherm is afgerond op
een heel getal. Daardoor kan er bij twee ritten allebei "(+20%)" staan, terwijl er maar bij één
een waarschuwing komt:

| Schatting | Eindprijs | Verschil op het scherm | Precies          | Waarschuwing |
| --------- | --------- | ---------------------- | ---------------- | ------------ |
| € 53,80   | € 64,56   | + € 10,76 (+20%)       | precies 20%      | nee          |
| € 53,80   | € 64,57   | + € 10,77 (+20%)       | net boven de 20% | ja           |

Krijg je geen waarschuwing, dan is de eindprijs dus hooguit 20% hoger dan de schatting. Je kunt
het verschil in euro's altijd zelf aflezen en de chauffeur ook dan om uitleg vragen.

## Meldingen

| Wat je ziet                                                                                                                           | Wat het betekent                                                                                                                                                         | Wat je kunt doen                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| "Kies een vertrekpunt en een bestemming." in het rood, en een rode rand om een keuzeveld                                              | Je hebt geen vertrekpunt of geen bestemming gekozen. Er wordt geen schatting gemaakt.                                                                                    | Kies wat er nog ontbreekt (het veld met de rode rand) en druk opnieuw op **Schatting opvragen**.       |
| "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk." in een oranje blok; de knop **Schatting opvragen** is grijs | Voor je vertrekpunt of bestemming is geen tarief bekend. In deze versie heeft alleen Amsterdam een tarief; voor een rit in of naar Rotterdam is geen schatting mogelijk. | Kies een ander vertrekpunt of een andere bestemming. De melding verdwijnt en de knop wordt weer blauw. |
| **Geen schatting mogelijk** met de knop **Terug naar start**                                                                          | De link naar de schatting is aangepast of onvolledig, of er is een stad zonder tarief gekozen. Er staat een van de twee meldingen hierboven bij.                         | Druk op **Terug naar start** en vraag de schatting opnieuw op via het startscherm.                     |
| "404" en "This page could not be found."                                                                                              | De ritlink is onbekend: de link is niet volledig gekopieerd of klopt niet, of de rit is na 30 dagen verwijderd.                                                          | Controleer of je de hele link hebt gebruikt. Werkt hij niet, dan is de rit niet meer op te vragen.     |
