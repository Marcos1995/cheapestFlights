# Desvío

Web estática: busca **ida o ida y vuelta** entre aeropuertos reales.

1. Al abrir: **una** pasada Kiwi (hoy → ~11 meses).
2. Filtras origen/destino/fechas sobre esos resultados.
3. Solo **tarifa error** o **ciudad oculta**, con el ahorro. Si no hay, se cede a Google Flights.

Pública: https://marcos1995.github.io/cheapestFlights/

## Setup

```bash
npm install
npm test
npm run dev
```

Local: [http://localhost:3000](http://localhost:3000)

GitHub Pages usa `GITHUB_PAGES=true npm run build` (base `/cheapestFlights`).

## Docs

- `docs/designs/desvio-not-a-comparator.md`
- `docs/designs/desvio-freeze-measure-demand.md`
- `PROJECT.md`
- `AGENTS.md`
