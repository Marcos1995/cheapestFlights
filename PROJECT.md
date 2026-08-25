<!-- managed-by-telegram-cursor-bot:agent-kit -->
# Contexto del proyecto

## Produccion
- URL:
- Deploy: pendiente (Vercel)

## Stack
- Next.js 15 App Router, TypeScript, React 19
- Motor de búsqueda mock en `lib/engine.ts` + `lib/catalog.json`
- UI en español, producto **Desvío**

## Comandos utiles
- Instalar: `npm install`
- Test: `npm test`
- Dev: `npm run dev`
- Build: `npm run build`

## Notas para el agente
- Preferencias / arquitectura: wedge BCN one-way; no clonar Skyscanner; hidden-city opcional y etiquetado; tarifas error fuera del search
- Cosas que NO tocar: no añadir GDS/scraper en v1; no mezclar badges de desvío legal y ciudad oculta
- gstack only (ver AGENTS.md)
- Diseño: `docs/designs/desvio-cheaper-weird-itineraries.md`
