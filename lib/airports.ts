export type Airport = {
  iata: string;
  city: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  hub?: boolean;
};

export const AIRPORTS: Airport[] = [
  { iata: "BCN", city: "Barcelona", name: "El Prat", country: "España", lat: 41.3, lng: 2.08 },
  { iata: "MAD", city: "Madrid", name: "Barajas", country: "España", lat: 40.47, lng: -3.56, hub: true },
  { iata: "AGP", city: "Málaga", name: "Costa del Sol", country: "España", lat: 36.67, lng: -4.5 },
  { iata: "PMI", city: "Palma", name: "Son Sant Joan", country: "España", lat: 39.55, lng: 2.73 },
  { iata: "VLC", city: "Valencia", name: "Manises", country: "España", lat: 39.49, lng: -0.48 },
  { iata: "SVQ", city: "Sevilla", name: "San Pablo", country: "España", lat: 37.42, lng: -5.89 },
  { iata: "BIO", city: "Bilbao", name: "Loiú", country: "España", lat: 43.3, lng: -2.91 },
  { iata: "ALC", city: "Alicante", name: "Elche", country: "España", lat: 38.28, lng: -0.56 },
  { iata: "TFN", city: "Tenerife", name: "Norte", country: "España", lat: 28.48, lng: -16.34 },
  { iata: "LPA", city: "Gran Canaria", name: "Gando", country: "España", lat: 27.93, lng: -15.39 },
  { iata: "RGS", city: "Burgos", name: "Villafría", country: "España", lat: 42.36, lng: -3.62 },
  { iata: "SCQ", city: "Santiago", name: "Rosalía de Castro", country: "España", lat: 42.9, lng: -8.42 },
  { iata: "FCO", city: "Roma", name: "Fiumicino", country: "Italia", lat: 41.8, lng: 12.25, hub: true },
  { iata: "CIA", city: "Roma", name: "Ciampino", country: "Italia", lat: 41.8, lng: 12.59 },
  { iata: "MXP", city: "Milán", name: "Malpensa", country: "Italia", lat: 45.63, lng: 8.72, hub: true },
  { iata: "LIN", city: "Milán", name: "Linate", country: "Italia", lat: 45.45, lng: 9.28 },
  { iata: "BGY", city: "Milán", name: "Bérgamo Orio al Serio", country: "Italia", lat: 45.67, lng: 9.7 },
  { iata: "VCE", city: "Venecia", name: "Marco Polo", country: "Italia", lat: 45.51, lng: 12.35 },
  { iata: "NAP", city: "Nápoles", name: "Capodichino", country: "Italia", lat: 40.89, lng: 14.29 },
  { iata: "BLQ", city: "Bolonia", name: "Guglielmo Marconi", country: "Italia", lat: 44.54, lng: 11.29 },
  { iata: "CDG", city: "París", name: "Charles de Gaulle", country: "Francia", lat: 49.01, lng: 2.55, hub: true },
  { iata: "ORY", city: "París", name: "Orly", country: "Francia", lat: 48.72, lng: 2.36 },
  { iata: "BVA", city: "París", name: "Beauvais", country: "Francia", lat: 49.45, lng: 2.11 },
  { iata: "NCE", city: "Niza", name: "Côte d'Azur", country: "Francia", lat: 43.66, lng: 7.22 },
  { iata: "LYS", city: "Lyon", name: "Saint-Exupéry", country: "Francia", lat: 45.73, lng: 5.08 },
  { iata: "MRS", city: "Marsella", name: "Provence", country: "Francia", lat: 43.44, lng: 5.22 },
  { iata: "NTE", city: "Nantes", name: "Atlantique", country: "Francia", lat: 47.15, lng: -1.61 },
  { iata: "LHR", city: "Londres", name: "Heathrow", country: "Reino Unido", lat: 51.47, lng: -0.45, hub: true },
  { iata: "LGW", city: "Londres", name: "Gatwick", country: "Reino Unido", lat: 51.15, lng: -0.19 },
  { iata: "STN", city: "Londres", name: "Stansted", country: "Reino Unido", lat: 51.89, lng: 0.26 },
  { iata: "LTN", city: "Londres", name: "Luton", country: "Reino Unido", lat: 51.87, lng: -0.37 },
  { iata: "MAN", city: "Mánchester", name: "Manchester", country: "Reino Unido", lat: 53.35, lng: -2.27 },
  { iata: "EDI", city: "Edimburgo", name: "Edinburgh", country: "Reino Unido", lat: 55.95, lng: -3.37 },
  { iata: "AMS", city: "Ámsterdam", name: "Schiphol", country: "Países Bajos", lat: 52.31, lng: 4.76, hub: true },
  { iata: "EIN", city: "Eindhoven", name: "Eindhoven", country: "Países Bajos", lat: 51.45, lng: 5.37 },
  { iata: "FRA", city: "Fráncfort", name: "Frankfurt", country: "Alemania", lat: 50.04, lng: 8.56, hub: true },
  { iata: "HHN", city: "Fráncfort", name: "Hahn", country: "Alemania", lat: 49.95, lng: 7.26 },
  { iata: "MUC", city: "Múnich", name: "Franz Josef Strauss", country: "Alemania", lat: 48.35, lng: 11.79, hub: true },
  { iata: "BER", city: "Berlín", name: "Brandenburg", country: "Alemania", lat: 52.37, lng: 13.5 },
  { iata: "DUS", city: "Düsseldorf", name: "Düsseldorf", country: "Alemania", lat: 51.29, lng: 6.77 },
  { iata: "NRN", city: "Düsseldorf", name: "Weeze", country: "Alemania", lat: 51.6, lng: 6.14 },
  { iata: "HAM", city: "Hamburgo", name: "Hamburg", country: "Alemania", lat: 53.63, lng: 10.0 },
  { iata: "CGN", city: "Colonia", name: "Konrad Adenauer", country: "Alemania", lat: 50.87, lng: 7.14 },
  { iata: "STR", city: "Stuttgart", name: "Stuttgart", country: "Alemania", lat: 48.69, lng: 9.22 },
  { iata: "LIS", city: "Lisboa", name: "Humberto Delgado", country: "Portugal", lat: 38.77, lng: -9.13, hub: true },
  { iata: "OPO", city: "Oporto", name: "Sá Carneiro", country: "Portugal", lat: 41.24, lng: -8.68 },
  { iata: "FAO", city: "Faro", name: "Faro", country: "Portugal", lat: 37.01, lng: -7.97 },
  { iata: "ATH", city: "Atenas", name: "Eleftherios Venizelos", country: "Grecia", lat: 37.94, lng: 23.94, hub: true },
  { iata: "SKG", city: "Salónica", name: "Makedonia", country: "Grecia", lat: 40.52, lng: 22.97 },
  { iata: "ZRH", city: "Zúrich", name: "Kloten", country: "Suiza", lat: 47.46, lng: 8.55, hub: true },
  { iata: "GVA", city: "Ginebra", name: "Cointrin", country: "Suiza", lat: 46.24, lng: 6.11 },
  { iata: "VIE", city: "Viena", name: "Schwechat", country: "Austria", lat: 48.11, lng: 16.57, hub: true },
  { iata: "BRU", city: "Bruselas", name: "Zaventem", country: "Bélgica", lat: 50.9, lng: 4.48 },
  { iata: "CRL", city: "Bruselas", name: "Charleroi", country: "Bélgica", lat: 50.46, lng: 4.45 },
  { iata: "CPH", city: "Copenhague", name: "Kastrup", country: "Dinamarca", lat: 55.62, lng: 12.65, hub: true },
  { iata: "OSL", city: "Oslo", name: "Gardermoen", country: "Noruega", lat: 60.19, lng: 11.1 },
  { iata: "ARN", city: "Estocolmo", name: "Arlanda", country: "Suecia", lat: 59.65, lng: 17.92, hub: true },
  { iata: "HEL", city: "Helsinki", name: "Vantaa", country: "Finlandia", lat: 60.32, lng: 24.96, hub: true },
  { iata: "DUB", city: "Dublín", name: "Dublin", country: "Irlanda", lat: 53.43, lng: -6.24, hub: true },
  { iata: "WAW", city: "Varsovia", name: "Chopin", country: "Polonia", lat: 52.17, lng: 20.97, hub: true },
  { iata: "PRG", city: "Praga", name: "Václav Havel", country: "Chequia", lat: 50.1, lng: 14.26 },
  { iata: "BUD", city: "Budapest", name: "Ferenc Liszt", country: "Hungría", lat: 47.44, lng: 19.26 },
  { iata: "OTP", city: "Bucarest", name: "Otopeni", country: "Rumanía", lat: 44.57, lng: 26.1 },
  { iata: "SOF", city: "Sofía", name: "Sofia", country: "Bulgaria", lat: 42.7, lng: 23.41 },
  { iata: "ZAG", city: "Zagreb", name: "Franjo Tuđman", country: "Croacia", lat: 45.74, lng: 16.07 },
  { iata: "DBV", city: "Dubrovnik", name: "Dubrovnik", country: "Croacia", lat: 42.56, lng: 18.27 },
  { iata: "IST", city: "Estambul", name: "Istanbul", country: "Turquía", lat: 41.26, lng: 28.74, hub: true },
  { iata: "SAW", city: "Estambul", name: "Sabiha Gökçen", country: "Turquía", lat: 40.9, lng: 29.31 },
  { iata: "AYT", city: "Antalya", name: "Antalya", country: "Turquía", lat: 36.9, lng: 30.8 },
  { iata: "DXB", city: "Dubái", name: "Dubai", country: "EAU", lat: 25.25, lng: 55.36, hub: true },
  { iata: "AUH", city: "Abu Dabi", name: "Zayed", country: "EAU", lat: 24.43, lng: 54.65, hub: true },
  { iata: "DOH", city: "Doha", name: "Hamad", country: "Catar", lat: 25.27, lng: 51.61, hub: true },
  { iata: "RUH", city: "Riad", name: "King Khalid", country: "Arabia Saudí", lat: 24.96, lng: 46.7, hub: true },
  { iata: "JED", city: "Yeda", name: "King Abdulaziz", country: "Arabia Saudí", lat: 21.68, lng: 39.16 },
  { iata: "CAI", city: "El Cairo", name: "Cairo", country: "Egipto", lat: 30.12, lng: 31.41, hub: true },
  { iata: "CMN", city: "Casablanca", name: "Mohammed V", country: "Marruecos", lat: 33.37, lng: -7.59, hub: true },
  { iata: "RAK", city: "Marrakech", name: "Menara", country: "Marruecos", lat: 31.61, lng: -8.04 },
  { iata: "TUN", city: "Túnez", name: "Carthage", country: "Túnez", lat: 36.85, lng: 10.23 },
  { iata: "ALG", city: "Argel", name: "Houari Boumediene", country: "Argelia", lat: 36.69, lng: 3.22 },
  { iata: "JNB", city: "Johannesburgo", name: "O.R. Tambo", country: "Sudáfrica", lat: -26.14, lng: 28.25, hub: true },
  { iata: "CPT", city: "Ciudad del Cabo", name: "Cape Town", country: "Sudáfrica", lat: -33.97, lng: 18.6 },
  { iata: "ADD", city: "Adís Abeba", name: "Bole", country: "Etiopía", lat: 8.98, lng: 38.8, hub: true },
  { iata: "NBO", city: "Nairobi", name: "Jomo Kenyatta", country: "Kenia", lat: -1.32, lng: 36.93, hub: true },
  { iata: "LOS", city: "Lagos", name: "Murtala Muhammed", country: "Nigeria", lat: 6.58, lng: 3.32 },
  { iata: "JFK", city: "Nueva York", name: "JFK", country: "EE. UU.", lat: 40.64, lng: -73.78, hub: true },
  { iata: "EWR", city: "Nueva York", name: "Newark", country: "EE. UU.", lat: 40.69, lng: -74.17, hub: true },
  { iata: "LGA", city: "Nueva York", name: "LaGuardia", country: "EE. UU.", lat: 40.78, lng: -73.87 },
  { iata: "BOS", city: "Boston", name: "Logan", country: "EE. UU.", lat: 42.36, lng: -71.01 },
  { iata: "ORD", city: "Chicago", name: "O'Hare", country: "EE. UU.", lat: 41.98, lng: -87.9, hub: true },
  { iata: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "EE. UU.", lat: 33.64, lng: -84.43, hub: true },
  { iata: "MIA", city: "Miami", name: "Miami", country: "EE. UU.", lat: 25.8, lng: -80.29, hub: true },
  { iata: "DFW", city: "Dallas", name: "Fort Worth", country: "EE. UU.", lat: 32.9, lng: -97.04, hub: true },
  { iata: "LAX", city: "Los Ángeles", name: "LAX", country: "EE. UU.", lat: 33.94, lng: -118.41, hub: true },
  { iata: "SFO", city: "San Francisco", name: "SFO", country: "EE. UU.", lat: 37.62, lng: -122.38, hub: true },
  { iata: "SEA", city: "Seattle", name: "Tacoma", country: "EE. UU.", lat: 47.45, lng: -122.31, hub: true },
  { iata: "DEN", city: "Denver", name: "Denver", country: "EE. UU.", lat: 39.86, lng: -104.67, hub: true },
  { iata: "IAD", city: "Washington", name: "Dulles", country: "EE. UU.", lat: 38.94, lng: -77.46, hub: true },
  { iata: "YYZ", city: "Toronto", name: "Pearson", country: "Canadá", lat: 43.68, lng: -79.63, hub: true },
  { iata: "YVR", city: "Vancouver", name: "Vancouver", country: "Canadá", lat: 49.19, lng: -123.18 },
  { iata: "YUL", city: "Montreal", name: "Trudeau", country: "Canadá", lat: 45.47, lng: -73.74 },
  { iata: "MEX", city: "Ciudad de México", name: "Benito Juárez", country: "México", lat: 19.44, lng: -99.07, hub: true },
  { iata: "CUN", city: "Cancún", name: "Cancún", country: "México", lat: 21.04, lng: -86.87 },
  { iata: "GRU", city: "São Paulo", name: "Guarulhos", country: "Brasil", lat: -23.43, lng: -46.47, hub: true },
  { iata: "GIG", city: "Río de Janeiro", name: "Galeão", country: "Brasil", lat: -22.81, lng: -43.25 },
  { iata: "EZE", city: "Buenos Aires", name: "Ezeiza", country: "Argentina", lat: -34.82, lng: -58.54, hub: true },
  { iata: "SCL", city: "Santiago", name: "Arturo Merino", country: "Chile", lat: -33.39, lng: -70.79, hub: true },
  { iata: "BOG", city: "Bogotá", name: "El Dorado", country: "Colombia", lat: 4.7, lng: -74.15, hub: true },
  { iata: "LIM", city: "Lima", name: "Jorge Chávez", country: "Perú", lat: -12.02, lng: -77.11, hub: true },
  { iata: "NRT", city: "Tokio", name: "Narita", country: "Japón", lat: 35.77, lng: 140.39, hub: true },
  { iata: "HND", city: "Tokio", name: "Haneda", country: "Japón", lat: 35.55, lng: 139.78, hub: true },
  { iata: "KIX", city: "Osaka", name: "Kansai", country: "Japón", lat: 34.43, lng: 135.24 },
  { iata: "ICN", city: "Seúl", name: "Incheon", country: "Corea del Sur", lat: 37.46, lng: 126.44, hub: true },
  { iata: "PEK", city: "Pekín", name: "Capital", country: "China", lat: 40.08, lng: 116.58, hub: true },
  { iata: "PVG", city: "Shanghái", name: "Pudong", country: "China", lat: 31.14, lng: 121.81, hub: true },
  { iata: "HKG", city: "Hong Kong", name: "Chek Lap Kok", country: "Hong Kong", lat: 22.31, lng: 113.91, hub: true },
  { iata: "TPE", city: "Taipei", name: "Taoyuan", country: "Taiwán", lat: 25.08, lng: 121.23, hub: true },
  { iata: "SIN", city: "Singapur", name: "Changi", country: "Singapur", lat: 1.36, lng: 103.99, hub: true },
  { iata: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Tailandia", lat: 13.69, lng: 100.75, hub: true },
  { iata: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "Malasia", lat: 2.75, lng: 101.71, hub: true },
  { iata: "CGK", city: "Yakarta", name: "Soekarno-Hatta", country: "Indonesia", lat: -6.13, lng: 106.66, hub: true },
  { iata: "MNL", city: "Manila", name: "Ninoy Aquino", country: "Filipinas", lat: 14.51, lng: 121.02 },
  { iata: "DEL", city: "Delhi", name: "Indira Gandhi", country: "India", lat: 28.56, lng: 77.1, hub: true },
  { iata: "BOM", city: "Bombay", name: "Chhatrapati Shivaji", country: "India", lat: 19.09, lng: 72.87, hub: true },
  { iata: "BLR", city: "Bangalore", name: "Kempegowda", country: "India", lat: 13.2, lng: 77.71 },
  { iata: "SYD", city: "Sídney", name: "Kingsford Smith", country: "Australia", lat: -33.95, lng: 151.18, hub: true },
  { iata: "MEL", city: "Melbourne", name: "Tullamarine", country: "Australia", lat: -37.67, lng: 144.84 },
  { iata: "AKL", city: "Auckland", name: "Auckland", country: "Nueva Zelanda", lat: -37.01, lng: 174.79, hub: true },
  { iata: "TLV", city: "Tel Aviv", name: "Ben Gurion", country: "Israel", lat: 32.01, lng: 34.89 },
  { iata: "AMM", city: "Ammán", name: "Queen Alia", country: "Jordania", lat: 31.72, lng: 35.99 },
  { iata: "BEY", city: "Beirut", name: "Rafic Hariri", country: "Líbano", lat: 33.82, lng: 35.49 },
  { iata: "KEF", city: "Reikiavik", name: "Keflavík", country: "Islandia", lat: 63.99, lng: -22.61, hub: true },
  { iata: "TFS", city: "Tenerife", name: "Sur", country: "España", lat: 28.04, lng: -16.57 },
  { iata: "IBZ", city: "Ibiza", name: "Ibiza", country: "España", lat: 38.87, lng: 1.37 },
  { iata: "ACE", city: "Lanzarote", name: "César Manrique", country: "España", lat: 28.95, lng: -13.61 },
];

const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata, a]));

export function getAirport(iata: string): Airport | undefined {
  return BY_IATA.get(iata.toUpperCase());
}

function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function searchAirports(query: string, limit = 12): Airport[] {
  const q = fold(query.trim());
  if (!q) return AIRPORTS.filter((a) => a.hub).slice(0, limit);
  const scored = AIRPORTS.map((a) => {
    const iata = fold(a.iata);
    const city = fold(a.city);
    const name = fold(a.name);
    const country = fold(a.country);
    let score = 0;
    if (iata === q) score = 100;
    else if (iata.startsWith(q)) score = 80;
    else if (city === q) score = 70;
    else if (city.startsWith(q)) score = 60;
    else if (city.includes(q) || name.includes(q) || iata.includes(q)) score = 40;
    else if (country.includes(q)) score = 10;
    return { a, score };
  }).filter((x) => x.score > 0);
  scored.sort((x, y) => y.score - x.score || x.a.iata.localeCompare(y.a.iata));
  return scored.slice(0, limit).map((x) => x.a);
}

export function labelAirport(a: Airport): string {
  return `${a.city} (${a.iata})`;
}

export const HUBS = AIRPORTS.filter((a) => a.hub);
