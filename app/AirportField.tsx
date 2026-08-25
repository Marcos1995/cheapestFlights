"use client";

import { useEffect, useRef, useState } from "react";
import { getAirport, labelAirport, searchAirports, type Airport } from "@/lib/airports";

export function AirportField({
  label,
  value,
  onChange,
  allowAnywhere = false,
  anywhereKind = "dest",
}: {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  allowAnywhere?: boolean;
  anywhereKind?: "origin" | "dest";
}) {
  const anywhereTitle = anywhereKind === "origin" ? "Cualquier origen" : "Cualquier destino";
  const anywhereHint =
    anywhereKind === "origin"
      ? "De cualquier aeropuerto del mundo"
      : "Asia, Europa, América… el más barato primero";
  const [text, setText] = useState(() => {
    if (!value) return "";
    if (value === "ANY") return anywhereTitle;
    const a = getAirport(value);
    return a ? labelAirport(a) : value;
  });
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (!value) {
      setText("");
      return;
    }
    if (value === "ANY") {
      setText(anywhereTitle);
      return;
    }
    const a = getAirport(value);
    if (a) setText(labelAirport(a));
    else setText(value);
  }, [value, anywhereTitle]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hits = searchAirports(text, 12);

  function pick(a: Airport) {
    onChange(a.iata);
    setText(labelAirport(a));
    setOpen(false);
  }

  function pickAnywhere() {
    onChange("ANY");
    setText(anywhereTitle);
    setOpen(false);
  }

  function commitTyped() {
    const raw = text.trim();
    if (!raw) {
      onChange("");
      return;
    }
    const q = raw.toLowerCase();
    if (allowAnywhere && /cualquier|anywhere|mundo|asia|europa|am[eé]rica/.test(q)) {
      pickAnywhere();
      return;
    }
    const exact = getAirport(raw.toUpperCase());
    if (exact) {
      pick(exact);
      return;
    }
    if (/^[A-Za-z]{3}$/.test(raw)) {
      onChange(raw.toUpperCase());
      setOpen(false);
      return;
    }
    const first = searchAirports(raw, 1)[0];
    if (first) pick(first);
  }

  return (
    <label className="airport-field" ref={box}>
      {label}
      <input
        value={text}
        autoComplete="off"
        placeholder=""
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => commitTyped()}
      />
      {open && (
        <ul className="airport-list">
          {allowAnywhere && (
            <li>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={pickAnywhere}>
                <b className="iata">∞</b>
                <span className="city">{anywhereTitle}</span>
                <span className="airport-name">{anywhereHint}</span>
                <span className="country">todo el mundo</span>
              </button>
            </li>
          )}
          {hits.length === 0 && !allowAnywhere && <li className="airport-empty">Sin coincidencias</li>}
          {hits.map((a) => (
            <li key={a.iata}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(a)}>
                <b className="iata">{a.iata}</b>
                <span className="city">{a.city}</span>
                <span className="airport-name">{a.name}</span>
                <span className="country">{a.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}
