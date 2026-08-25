"use client";

import { useEffect, useRef, useState } from "react";
import { getAirport, labelAirport, searchAirports, type Airport } from "@/lib/airports";

export function AirportField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (iata: string) => void;
}) {
  const [text, setText] = useState(() => {
    const a = getAirport(value);
    return a ? labelAirport(a) : value;
  });
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLLabelElement>(null);

  useEffect(() => {
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

  function commitTyped() {
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
          {hits.length === 0 && <li className="airport-empty">Sin coincidencias</li>}
          {hits.map((a) => (
            <li key={a.iata}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(a)}>
                <strong>{a.iata}</strong> {a.city} · {a.name}
                <span>{a.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}
