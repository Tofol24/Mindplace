# Explica-ho

Eina d'estudi per a 4t d'ESO: s'hi pugen apunts (fotos, captures, PDF, Word o text),
Claude els ordena en un resum, un mapa conceptual i una llista de conceptes clau,
i després fa preguntes en quatre nivells de profunditat (recordar, comprendre,
relacionar, integrar). Es pot respondre parlant (micròfon) o escrivint, i Claude
valora què se sap, què falta i com encaixar-ho a l'explicació.

## Fitxers

- `explica-ho.html` — font de la pàgina publicada a claude.ai (Artifact). No porta
  `<html>`, `<head>` ni `<body>`: la plataforma els hi posa en publicar-la.
- `explica-ho-autonom.html` — la mateixa pàgina, per obrir-la directament al navegador.
  Es genera amb `./fes-autonom.sh`; no s'edita a mà.

## Dues maneres de fer-la servir

| | A claude.ai (Artifact) | Fitxer obert al navegador |
|---|---|---|
| Claude | El compte de qui la té oberta (demana permís la primera vegada) | Clau de l'API d'Anthropic (Configuració) |
| On es guarda | Espai privat del compte | Aquest navegador |
| Micròfon | No disponible dins claude.ai: es dicta amb el teclat (micròfon del teclat del mòbil, Windows + H, Fn Fn al Mac) | Botó «Parla» (Chrome, Edge, Safari) |

No forma part de l'app APRENS (`app/`): no es desplega a Netlify i fa crides a
serveis externs (Claude i les biblioteques de lectura de PDF i Word).
