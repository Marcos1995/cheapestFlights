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
- Origen/destino ANY = Kiwi `anywhere` en cualquiera de los dos
- Orden: tarifa error (≤50 % y ≥80 € vs hace 7 días) → ciudad oculta → gran descuento (≥25 % y ≥25 €) → resto
- Fechas: un día, rango desde–hasta, o un mes entero
- Si no hay error hoy (día concreto), pistas de fechas +2/+3/+5/+7/+10/+15
- gstack only (ver AGENTS.md)
