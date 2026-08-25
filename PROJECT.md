<!-- managed-by-telegram-cursor-bot:agent-kit -->
# Contexto del proyecto

## Produccion
- URL: https://marcos1995.github.io/cheapestFlights/
- Deploy: GitHub Pages (Actions, static export)

## Stack
- Next.js 15 App Router, TypeScript, React 19, `output: "export"`
- Precios vivos: Kiwi/Skypicker GraphQL (cliente, CORS `*`)
- Enlaces: Google Flights, Skyscanner, reserva Kiwi
- UI en español, producto **Desvío**

## Comandos utiles
- Instalar: `npm install`
- Test: `npm test`
- Dev: `npm run dev`
- Build local: `npm run build`
- Build Pages: `GITHUB_PAGES=true npm run build`

## Notas para el agente
- No mostrar precios inventados. Si Kiwi falla, dejar los enlaces oficiales.
- Pestaña tarifa error = comparar con la misma ruta 7 días antes (o después si esa fecha ya pasó)
- gstack only (ver AGENTS.md)
