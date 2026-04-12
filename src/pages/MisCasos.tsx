import { useState } from "react";
import { useCases } from "@/hooks/useCases";
import { riskColors, origenLabels } from "@/lib/api";
import type { CaseRecord } from "@/lib/api";
import KpiCard from "@/components/KpiCard";
import Badge from "@/components/Badge";
import ResultPanel from "@/components/ResultPanel";

export default function MisCasos() {
  const { cases } = useCases();
  const [filter, setFilter] = useState<"all" | "resuelto" | "revision">("all");
  const [selected, setSelected] = useState<CaseRecord | null>(null);

  const filtered = filter === "all" ? cases : cases.filter((c) => c.estado === filter);
  const resueltos = cases.filter((c) => c.estado === "resuelto").length;
  const revision = cases.length - resueltos;

  return (
    <>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <KpiCard value={cases.length} label="Total Analizados" color="sky" />
        <KpiCard value={resueltos} label="Resueltos" color="green" />
        <KpiCard value={revision} label="Requieren Revision" color="orange" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">&#128196; Historial de Casos</h3>
          <div className="flex gap-2">
            {(["all", "resuelto", "revision"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  filter === f ? "border-sky-400 text-sky-400" : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}>
                {f === "all" ? "Todos" : f === "resuelto" ? "Resueltos" : "Requiere Revision"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            <div className="mb-2 text-2xl">&#128196;</div>
            No hay casos {filter === "all" ? "registrados" : "con este filtro"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5">Fecha</th>
                  <th className="px-3 py-2.5">Paciente</th>
                  <th className="px-3 py-2.5">Area</th>
                  <th className="px-3 py-2.5">Prioridad</th>
                  <th className="px-3 py-2.5">Riesgo</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c)}
                    className="cursor-pointer border-b border-slate-700/40 transition hover:bg-slate-900/50">
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">
                      {new Date(c.timestamp).toLocaleDateString()}{" "}
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-2.5 font-semibold">{c.paciente_id}</td>
                    <td className="px-3 py-2.5">{origenLabels[c.origen] || c.origen}</td>
                    <td className="px-3 py-2.5"><Badge variant={c.prioridad === "alta" ? "alta" : "normal"}>{c.prioridad}</Badge></td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-bold uppercase" style={{ color: riskColors[c.riesgo] || "#94a3b8" }}>{c.riesgo}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={c.estado === "resuelto" ? "auto" : "revision"}>
                        {c.estado === "resuelto" ? "Resuelto" : "Revision"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">Ver &rarr;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail overlay */}
      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 p-7"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Caso {selected.paciente_id} - {origenLabels[selected.origen] || selected.origen}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            {/* Meta grid */}
            <div className="mb-5 grid grid-cols-4 gap-3">
              {[
                ["Paciente", selected.paciente_id],
                ["Area", origenLabels[selected.origen] || selected.origen],
                ["Riesgo", selected.riesgo],
                ["Tiempo", (selected.latency / 1000).toFixed(1) + "s"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-950 p-3">
                  <div className="text-[10px] uppercase text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-semibold" style={label === "Riesgo" ? { color: riskColors[value] || "#94a3b8", textTransform: "uppercase" } : {}}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical text */}
            <div className="mb-4">
              <div className="mb-1 text-xs font-semibold uppercase text-slate-500">Descripcion Clinica Enviada</div>
              <div className="rounded-lg bg-slate-950 p-3 text-sm leading-relaxed text-slate-400">{selected.texto}</div>
            </div>

            {/* Analysis */}
            <ResultPanel caso={selected} />
          </div>
        </div>
      )}
    </>
  );
}
