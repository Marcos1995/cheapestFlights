# Desvío

Web estática: busca de **cualquier aeropuerto a cualquier otro** (red de hubs mundiales). No es un clon de Skyscanner.

1. El vuelo **directo estándar**.
2. Una **escala más barata** si cabe en las horas de espera que eliges.
3. **Tarifa error** si el modelo la marca en esa fecha (ilustrativo, no GDS).
4. Opcional: **ciudad oculta**, con avisos. Solo sin maleta facturada.
5. **Maletas** (kilos) y **asiento** suman al total, como extras de Google Flights.

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

- `docs/designs/desvio-freeze-measure-demand.md`
- `PROJECT.md`
- `AGENTS.md`
