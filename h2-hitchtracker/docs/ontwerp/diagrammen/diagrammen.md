# Aanvullende diagrammen HitchTracker

Mermaid-diagrammen (schermnavigatie, status, sequence). GitHub rendert ze direct.
De beoordeelde ontwerplagen staan in erd.dbml, use-case.puml en activiteitendiagram.puml.

## Schermnavigatie

```mermaid
flowchart LR
    A["Startscherm<br>vertrekpunt en bestemming"] -->|Schatting opvragen| B["Schattingsscherm<br>reistijd, prijs, tarief"]
    B -->|Terug| A
    B -->|Accepteren| C["Ritscherm<br>rit loopt"]
    C -->|Rit afgerond| D["Eindprijsscherm<br>eindprijs vs. schatting"]
    D -->|Nieuwe rit| A
```

## Status van een rit

```mermaid
stateDiagram-v2
    [*] --> Geaccepteerd: Reiziger accepteert schatting
    Geaccepteerd --> Afgerond: Chauffeur rondt rit af
    Afgerond --> [*]
```

## Sequencediagram kernflow

```mermaid
sequenceDiagram
    actor R as Reiziger
    actor C as Chauffeur
    participant A as App
    participant S as Server
    participant DB as Database

    R->>A: Vertrekpunt en bestemming kiezen
    A->>S: Schatting opvragen
    S->>DB: Actief tarief van de stad ophalen
    DB-->>S: Tarief
    S->>DB: Route ophalen
    DB-->>S: Afstand en duur
    S->>S: Prijs berekenen
    S-->>A: Schatting
    A-->>R: Reistijd, prijs en tarief tonen

    R->>A: Schatting accepteren
    A->>S: Rit aanmaken
    S->>DB: Rit opslaan met schatting
    DB-->>S: Rit-id (uuid)
    S-->>A: Link naar rit

    C->>A: Rit afronden (gesimuleerd)
    A->>S: Rit afronden
    S->>DB: Werkelijke afstand en duur opslaan
    S->>S: Eindprijs berekenen met hetzelfde tarief
    S->>DB: Eindprijs en status afgerond opslaan
    S-->>A: Eindprijs, schatting en verschil
    alt Eindprijs meer dan 20% hoger
        A-->>R: Eindprijs tonen met waarschuwing
    else Binnen 20%
        A-->>R: Eindprijs tonen
    end
```
