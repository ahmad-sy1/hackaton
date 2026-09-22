# Acceptatietest Sportschool De Kast

|                |             |
| -------------- | ----------- |
| Naam           | [AANVULLEN] |
| Leerlingnummer | [AANVULLEN] |
| Datum          | [AANVULLEN] |
| Versie         | [AANVULLEN] |

De tester vult de kolommen Werkelijk resultaat, Aanpassingen, Uren en Door in.
Prioriteit: 1 = laag, 2 = middel, 3 = hoog.

## US-01 Inchecken bij de ingang

### 1. Inchecken met de juiste gegevens

| Actie     | Scenario                                                                                             | Verwacht resultaat                                                       | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| --------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------- | ------------ | ---- | ---------- | ---- |
| Inchecken | Een lid dat deze week nog niet aan zijn maximum zit, vult zijn lidnummer en pincode in bij de ingang | Het lid krijgt toegang en ziet een welkomstmelding met zijn naam         |                     |              |      | 3          |      |
| Inchecken | Een lid met een onbeperkt abonnement checkt in, ook al is hij deze week al vaker geweest             | Het lid krijgt altijd toegang en ziet nooit een melding over een maximum |                     |              |      | 2          |      |
| Inchecken | Een lid dat vorige week zijn maximum haalde, maar deze week nog niet is geweest, checkt in           | Het lid krijgt toegang: de bezoeken van vorige week tellen niet meer mee |                     |              |      | 3          |      |

### 2. Inchecken wordt geweigerd

| Actie     | Scenario                                                                       | Verwacht resultaat                                                                                                   | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| --------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Inchecken | Een lid dat deze week zijn maximum aantal bezoeken al heeft bereikt, checkt in | Het lid krijgt geen toegang en ziet de melding "Je hebt je bezoeklimiet al bereikt voor deze week"                   |                     |              |      | 3          |      |
| Inchecken | Een lid vult een verkeerde pincode in                                          | Het lid krijgt geen toegang en ziet een melding dat het lidnummer of de pincode niet klopt                           |                     |              |      | 3          |      |
| Inchecken | Iemand vult een lidnummer in dat niet bestaat                                  | Er is geen toegang en dezelfde melding als bij een verkeerde pincode, zodat niet te zien is of het lidnummer bestaat |                     |              |      | 2          |      |

### 3. Bezoeken worden bijgehouden

| Actie             | Scenario                                                                                           | Verwacht resultaat                                                                                    | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| ----------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Bezoeken bekijken | Na een geslaagde en een geweigerde incheckpoging bekijkt een medewerker het overzicht van bezoeken | Beide pogingen staan in het overzicht, met wie het was, wanneer, welk abonnement en of er toegang was |                     |              |      | 3          |      |

## US-02 Abonnement opzeggen

### 4. Opzeggen en bevestigen

| Actie    | Scenario                                                               | Verwacht resultaat                                                                                                                                                        | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Opzeggen | Een lid logt in op "Mijn abonnement", kiest voor opzeggen en bevestigt | Het lid ziet eerst een bevestigingsscherm waarop staat dat er nog niets verandert. Na bevestigen verschijnt een bericht met de datum tot wanneer de toegang geldig blijft |                     |              |      | 3          |      |
| Opzeggen | Een lid kiest voor opzeggen, maar gaat terug zonder te bevestigen      | Het abonnement blijft gewoon actief en de knop om op te zeggen is er nog                                                                                                  |                     |              |      | 3          |      |
| Opzeggen | Een lid dat al heeft opgezegd, opent "Mijn abonnement"                 | Het lid ziet dat het abonnement is opgezegd en tot wanneer het loopt. Opnieuw opzeggen kan niet                                                                           |                     |              |      | 2          |      |

### 5. Toegang na opzeggen

| Actie     | Scenario                                                | Verwacht resultaat                                                 | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| --------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------- | ------------ | ---- | ---------- | ---- |
| Inchecken | Een lid dat heeft opgezegd, checkt in vóór de einddatum | Het lid krijgt nog gewoon toegang                                  |                     |              |      | 3          |      |
| Inchecken | Een lid van wie de einddatum voorbij is, checkt in      | Het lid krijgt geen toegang en ziet dat het abonnement is verlopen |                     |              |      | 3          |      |

## Beheer: bezoekgegevens anonimiseren

### 6. Oude bezoekgegevens anonimiseren

| Actie        | Scenario                                                                                                        | Verwacht resultaat                                                                                              | Werkelijk resultaat | Aanpassingen | Uren | Prioriteit | Door |
| ------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---- | ---------- | ---- |
| Anonimiseren | Een medewerker opent het beheerscherm, kiest voor anonimiseren en bevestigt                                     | Bij bezoeken van meer dan 14 dagen geleden is niet meer te zien wie het was; recente bezoeken tonen nog de naam |                     |              |      | 3          |      |
| Anonimiseren | Een medewerker opent het beheerscherm als er geen bezoeken van meer dan 14 dagen geleden meer met een naam zijn | De knop om te anonimiseren is zichtbaar, maar kan niet worden gebruikt                                          |                     |              |      | 1          |      |
