# Desvío

No es un clon de Skyscanner, Kayak o Google Flights. Es un buscador de **ida desde Barcelona** que pone juntos:

1. El vuelo **simple** (el obvio).
2. Un **desvío legal** más barato (escala extra, aeropuerto cercano o self-transfer).
3. Opcional: **ciudad oculta**, con avisos de contrato y maleta.

Las tarifas error no van en el buscador. Maqueta: `/demo/tarifa-error`.

Precios de `lib/catalog.json` (mock). No hay GDS.

## Setup

```bash
npm install
npm test
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y busca BCN → FCO.

## Docs

- `docs/designs/desvio-cheaper-weird-itineraries.md`
- `PROJECT.md` — contexto para agentes
- `AGENTS.md` — gstack workflow
