import { useState, useEffect, useCallback } from "react";
import { useCases } from "@/hooks/useCases";
import { SHEETS_CSV_URL, SHEETS_URL, parseCSV, riskColors } from "@/lib/api";
import KpiCard from "@/components/KpiCard";

export default function Dashboard() {
  const { cases } = useCases();
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  // Local KPIs
  const total = cases.length;
  const resueltos = cases.filter((c) => c.estado === "resuelto").length;
  const revision = total - resueltos;
  const lats = cases.map((c) => c.latency).filter(Boolean);
  const avgLat = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;

  const byRisk: Record<string, number> = { critico: 0, alto: 0, moderado: 0, bajo: 0 };
  cases.forEach((c) => { if (c.riesgo in byRisk) byRisk[c.riesgo]++; });
  const maxBar = Math.max(1, ...Object.values(byRisk));

  const autoPct = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  const loadSheetData = useCallback(async () => {
    setSheetLoading(true);
    setSheetError(null);
    try {
      const resp = await fetch(SHEETS_CSV_URL);
      const csv = await resp.text();
      const rows = parseCSV(csv);
      if (rows.length < 2) { setSheetRows([]); return; }
      setSheetHeaders(rows[0].map((h) => h.replace(/"/g, "").trim()));
      setSheetRows(rows.slice(1).filter((r) => r.length > 1 && r[0]));
    } catch (err: any) {
      setSheetError(err.message);
    } finally {
      setSheetLoading(false);
    }
  }, []);

  useEffect(() => { loadSheetData(); }, [loadSheetData]);

  // Find column indices for display
  const colIdx = {
    ts: sheetHeaders.findIndex((h) => /timestamp|fecha/i.test(h)),
    pac: sheetHeaders.findIndex((h) => /paciente/i.test(h)),
    orig: sheetHeaders.findIndex((h) => /origen/i.test(h)),
    tipo: sheetHeaders.findIndex((h) => /tipo/i.test(h)),
    riesgo: sheetHeaders.findIndex((h) => /riesgo/i.test(h)),
    dec: sheetHeaders.findIndex((h) => /decision/i.test(h)),
    conf: sheetHeaders.findIndex((h) => /confianza|score/i.test(h)),
    lat: sheetHeaders.findIndex((h) => /latencia|duracion/i.test(h)),
  };

  const clean = (row: string[], idx: number) => idx >= 0 && row[idx] ? row[idx].replace(/^"|"$/g, "") : "-";
  const displayRows = sheetRows.slice(-12).reverse();

  return (
    <>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <KpiCard value={total || "-"} label="Total Casos" color="sky" />
        <KpiCard value={total > 0 ? autoPct + "%" : "-"} label="Resueltos Auto." color="green" />
        <KpiCard value={total > 0 ? (100 - autoPct) + "%" : "-"} label="Requieren Revision" color="orange" />
        <KpiCard value={avgLat > 0 ? (avgLat / 1000).toFixed(1) + "s" : "-"} label="Tiempo Resp. Prom." color="purple" />
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        {/* Bar chart */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-4 text-sm font-semibold">&#128200; Distribucion por Riesgo</h3>
          {total === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Sin datos</div>
          ) : (
            <div className="flex items-end gap-3" style={{ height: 140 }}>
              {Object.entries(byRisk).map(([k, v]) => {
                const h = Math.max(4, (v / maxBar) * 120);
                return (
                  <div key={k} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-semibold">{v}</span>
                    <div className="w-full rounded-t" style={{ height: h, background: riskColors[k] || "#38bdf8" }} />
                    <span className="text-[10px] text-slate-500">{k}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-4 text-sm font-semibold">&#128202; Indicadores del Sistema</h3>
          <ProgressBar label="Tasa de Resolucion Automatica" value={autoPct} max={100} color={autoPct >= 50 ? "#4ade80" : "#fb923c"} note="Objetivo: >50%" />
          <ProgressBar label="Casos con Revision" value={revision} max={Math.max(total, 1)} color={revision > total * 0.5 ? "#fb923c" : "#38bdf8"} />
          <ProgressBar label="Tiempo Resp. Prom." value={avgLat / 1000} max={30} color={avgLat < 10000 ? "#4ade80" : "#fb923c"} note="Objetivo: <10s" />
        </div>
      </div>

      {/* Sheet data */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">&#128203; Registro de Actividad</h3>
          <div className="flex gap-2">
            <button onClick={loadSheetData}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:from-blue-700">
              &#8635; Actualizar
            </button>
            <a href={SHEETS_URL} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-sky-400 hover:text-sky-400">
              Abrir Registro Completo
            </a>
          </div>
        </div>

        {sheetLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-indigo-400">
            <span className="spinner" /> Cargando registro...
          </div>
        ) : sheetError ? (
          <div className="py-6 text-center text-sm text-red-400">
            No se pudo cargar el registro.{" "}
            <a href={SHEETS_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">Abrir directamente</a>
          </div>
        ) : displayRows.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">Sin datos en el registro</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5">Fecha</th>
                  <th className="px-3 py-2.5">Paciente</th>
                  <th className="px-3 py-2.5">Area</th>
                  <th className="px-3 py-2.5">Tipo</th>
                  <th className="px-3 py-2.5">Riesgo</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5">Confianza</th>
                  <th className="px-3 py-2.5">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-700/40">
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">{clean(r, colIdx.ts)}</td>
                    <td className="px-3 py-2.5 font-semibold">{clean(r, colIdx.pac)}</td>
                    <td className="px-3 py-2.5">{clean(r, colIdx.orig)}</td>
                    <td className="px-3 py-2.5">{clean(r, colIdx.tipo)}</td>
                    <td className="px-3 py-2.5">{clean(r, colIdx.riesgo)}</td>
                    <td className="px-3 py-2.5">{clean(r, colIdx.dec)}</td>
                    <td className="px-3 py-2.5">{clean(r, colIdx.conf)}</td>
                    <td className="px-3 py-2.5">{clean(r, colIdx.lat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ProgressBar({ label, value, max, color, note }: { label: string; value: number; max: number; color: string; note?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const display = value % 1 !== 0 ? value.toFixed(1) : Math.round(value);
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-slate-500">{display}{note ? ` | ${note}` : ""}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
