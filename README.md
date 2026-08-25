# Desvío

Web estática: busca **ida o ida y vuelta** entre aeropuertos reales.

1. Precio **vivo** (Kiwi.com) y botón de reserva.
2. El mismo trayecto en **Google Flights** y **Skyscanner** si no hay desvío.
3. Resultados: desvío legal (escala más barata que el directo), ciudad oculta, tarifa error. Si no hay, se cede.

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
