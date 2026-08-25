<!-- managed-by-telegram-cursor-bot:agent-kit -->
# Contexto del proyecto

## Produccion
- URL: https://marcos1995.github.io/cheapestFlights/
- Deploy: GitHub Pages (Actions, static export)

## Stack
- Next.js 15 App Router, TypeScript, React 19, `output: "export"`
- Motor ilustrativo mundial en `lib/engine.ts` + `lib/airports.ts` (cliente, sin GDS)
- UI en español, producto **Desvío**

## Comandos utiles
- Instalar: `npm install`
- Test: `npm test`
- Dev: `npm run dev`
- Build local: `npm run build`
- Build Pages: `GITHUB_PAGES=true npm run build`

## Notas para el agente
- Buscador origen/destino mundial; tarifa error por fecha; extras maleta/asiento; espera en escala
- No mezclar badges de desvío legal y ciudad oculta
- Precios mock hasta API real
- gstack only (ver AGENTS.md)
