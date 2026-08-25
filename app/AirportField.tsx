"use client";

import { useEffect, useRef, useState } from "react";
import { getAirport, labelAirport, searchAirports, type Airport } from "@/lib/airports";

export function AirportField({
  label,
  value,
  onChange,
  allowAnywhere = false,
}: {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  allowAnywhere?: boolean;
}) {
  const [text, setText] = useState(() => {
    if (value === "ANY") return "Cualquier destino";
    const a = getAirport(value);
    return a ? labelAirport(a) : value;
  });
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (value === "ANY") {
      setText("Cualquier destino");
      return;
    }
    const a = getAirport(value);
    if (a) setText(labelAirport(a));
  }, [value]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hits = searchAirports(text, 8);

  function pick(a: Airport) {
    onChange(a.iata);
    setText(labelAirport(a));
    setOpen(false);
  }

  function pickAnywhere() {
    onChange("ANY");
    setText("Cualquier destino");
    setOpen(false);
  }

  function commitTyped() {
    const q = text.trim().toLowerCase();
    if (allowAnywhere && /cualquier|anywhere|mundo|asia|europa|am[eé]rica/.test(q)) {
      pickAnywhere();
      return;
    }
    const exact = getAirport(text.trim().toUpperCase());
    if (exact) {
      pick(exact);
      return;
    }
    const first = searchAirports(text, 1)[0];
    if (first && text.trim()) pick(first);
  }

  return (
    <label className="airport-field" ref={box}>
      {label}
      <input
        value={text}
        autoComplete="off"
        placeholder="ciudad o IATA"
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
                <span className="city">Cualquier destino</span>
                <span className="airport-name">Asia, Europa, América… el más barato primero</span>
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
