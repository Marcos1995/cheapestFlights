import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/engine";
import type { SearchRequest } from "@/lib/types";

export async function POST(request: Request) {
  let body: Partial<SearchRequest>;
  try {
    body = (await request.json()) as Partial<SearchRequest>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const origin = String(body.origin ?? "BCN");
  const dest = String(body.dest ?? "");
  const date = String(body.date ?? "");
  const maxExtraHours = Number(body.maxExtraHours ?? 6);
  const referencePrice =
    body.referencePrice == null || body.referencePrice === ("" as never)
      ? undefined
      : Number(body.referencePrice);

  if (!dest || !date) {
    return NextResponse.json({ error: "Faltan destino o fecha" }, { status: 400 });
  }

  const result = searchFlights({
    origin,
    dest,
    date,
    maxExtraHours,
    referencePrice: Number.isFinite(referencePrice) ? referencePrice : undefined,
  });

  return NextResponse.json(result);
}
