import type { CaseRecord } from "@/lib/api";
import { riskColors, origenLabels } from "@/lib/api";
import Badge from "./Badge";

function parseHallazgos(h: string | string[] | undefined): string[] {
  if (!h) return [];
  if (Array.isArray(h)) return h;
  try {
    const parsed = JSON.parse(h);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* not JSON */ }
  return [String(h)];
}

export default function ResultPanel({ caso }: { caso: CaseRecord | null }) {
  if (!caso) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h3 className="mb-4 text-sm font-semibold">Resultado del Analisis</h3>
        <div className="py-10 text-center text-slate-500">
          <div className="mb-2 text-3xl">&#128269;</div>
          <p>Ingrese un caso para recibir el analisis clinico asistido por IA</p>
          <p className="mt-2 text-xs text-slate-600">El sistema analiza el caso y devuelve hallazgos, nivel de riesgo y recomendaciones</p>
        </div>
      </div>
    );
  }

  const r = caso.response;
  const hallazgos = parseHallazgos(r?.hallazgos);
  const recomendacion = r?.recomendacion || r?.respuesta_final || "";
  const razonamiento = r?.razonamiento || "";
  const confianza = r?.confianza_score ?? caso.confianza;
  const rColor = riskColors[caso.riesgo] || "#94a3b8";

  return (
    <div className="rounded-xl border border-emerald-900 bg-slate-950 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Analisis Clinico - {caso.paciente_id}</h4>
        <Badge variant={caso.estado === "resuelto" ? "auto" : "revision"}>
          {caso.estado === "resuelto" ? "Resuelto automaticamente" : "Requiere revision medica"}
        </Badge>
      </div>

      {/* Risk */}
      <div className="mb-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Nivel de Riesgo</div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: rColor }} />
          <span className="text-sm font-bold uppercase" style={{ color: rColor }}>{caso.riesgo}</span>
        </div>
      </div>

      {/* Hallazgos */}
      {hallazgos.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Hallazgos Clinicos</div>
          <ul className="space-y-1 text-sm text-slate-300">
            {hallazgos.map((h, i) => <li key={i} className="flex gap-2"><span className="text-slate-500">&bull;</span>{h}</li>)}
          </ul>
        </div>
      )}

      {/* Recomendacion */}
      {recomendacion && (
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Recomendacion</div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{recomendacion}</p>
        </div>
      )}

      {/* Razonamiento */}
      {razonamiento && (
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Razonamiento</div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{razonamiento}</p>
        </div>
      )}

      {/* Confianza */}
      {confianza != null && (
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Confianza del Analisis</div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${confianza}%`,
                  background: confianza >= 75 ? "#4ade80" : confianza >= 50 ? "#fbbf24" : "#f87171",
                }}
              />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: confianza >= 75 ? "#4ade80" : confianza >= 50 ? "#fbbf24" : "#f87171" }}
            >
              {confianza}/100
            </span>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 border-t border-slate-700 pt-3 text-xs text-slate-500">
        <span>&#128337; {(caso.latency / 1000).toFixed(1)}s</span>
        <span>&#128196; {caso.tipo_documento}</span>
        <span>&#127975; {origenLabels[caso.origen] || caso.origen}</span>
        <span>&#128197; {new Date(caso.timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
}
