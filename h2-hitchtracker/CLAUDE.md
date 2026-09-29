# CLAUDE.md — casusregels H2 HitchTracker

## Casus

HitchTracker: een reiziger ziet vóór, tijdens en na een taxirit de route, afstand en prijs,
zodat hij niet te veel betaalt. Drie epics:

1. **Vóór de reis:** bestemming invoeren → schatting van reistijd en kosten.
2. **Tijdens de reis:** gereden route, nog te rijden route, huidige prijs, schatting eindprijs.
3. **Na de reis:** eindprijs zien.

## Status

- Fase 1 (ontwerpen). De kernflow is **nog niet gekozen**; die bepaalt de docent.
- Verzin geen user stories, acceptatiecriteria of kernflow.

## Ontwerpnorm

- Tool per diagram:
  - ERD → DBML in docs/ontwerp/diagrammen/erd.dbml (render op dbdiagram.io)
  - Use case diagram → PlantUML in docs/ontwerp/diagrammen/use-case.puml
  - Activiteitendiagram → PlantUML in docs/ontwerp/diagrammen/activiteitendiagram.puml
  - Wireframes → docs/ontwerp/wireframes/
  - Aanvullend (sequence, status, schermnavigatie, klassen) → Mermaid, als ```mermaid-blok
    in docs/ontwerp/diagrammen/diagrammen.md
- Voor de logica-laag telt alleen een echt activiteitendiagram in PlantUML — geen
  Mermaid-flowchart, geen swimlane-diagram, geen sequencediagram.
- Gebruik geen Mermaid-betadiagrammen (usecase-beta, swimlane-beta): die renderen niet
  betrouwbaar in GitHub.
- De leeswijzer (v1.0.1) noemt nog "flowcharts/navigatie"; de nieuwere norm is leidend.
- Ontwerpbestanden in `docs/ontwerp/` schrijf je alleen als daar expliciet om gevraagd wordt.
  De ontwerpfase is van de docent.

## Privacy en security

- Locatie- en routegegevens zijn persoonsgegevens.
- Privacy-, bewaar- en securitykeuzes worden in het ontwerp vastgelegd. Neem er zelf niets over
  aan en verzin geen tabellen of kolommen.

## Tags

- Tags (`h2-fase1`, `h2-fase2`, `h2-fase3`) zet de docent.
