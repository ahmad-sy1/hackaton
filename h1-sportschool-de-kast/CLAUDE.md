@AGENTS.md

## Casusregels H1

- De 100%-basis van H1 fase 2 zijn de negen acceptatiecriteria van US-01 (toegang op
  abonnementstype) en US-02 (abonnement annuleren).
- Pincode: **nooit plaintext**, **nooit `int`** (leidende nullen gaan verloren). `varchar` + hashing.
- Bezoekaantal wordt **afgeleid via een query** op `visit_logs` vanaf afgelopen maandag —
  geen tellerkolom, geen resetlogica.
- Anonimiseren van bezoeklogs ouder dan 14 dagen gebeurt via een **handmatige knop** in het
  beheerscherm (`UPDATE visit_logs SET user_id = NULL WHERE ...`), niet via een cronjob.
