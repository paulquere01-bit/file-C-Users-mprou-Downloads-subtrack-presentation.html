# PostPilot AI

MVP SaaS autonome qui genere des posts LinkedIn a partir d'un brief simple.

## Fonctionnalites

- Landing page SaaS responsive.
- Generateur de posts LinkedIn avec objectif, audience, ton et longueur.
- Calendrier editorial de 7 idees.
- Historique local via `localStorage`.
- Copier le post et exporter les generations en JSON.
- Tests unitaires du moteur de generation.

## Lancer le projet

```bash
npm run dev
```

Puis ouvrir <http://localhost:5173>.

## Verification

```bash
npm run lint
npm test
```

## Notes produit

Le MVP fonctionne sans serveur ni cle API. Le moteur de generation est local et deterministe
pour faciliter la demo, les tests et une future integration avec un LLM cote backend.
