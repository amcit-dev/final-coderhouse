import { useState, type FormEvent } from "react";
import { useCases } from "@/hooks/useCases";
import { testCases } from "@/lib/testCases";
import type { CasePayload, CaseRecord } from "@/lib/api";
import ResultPanel from "@/components/ResultPanel";
import Badge from "@/components/Badge";
import { origenLabels } from "@/lib/api";

export default function NuevoCaso() {
  const { cases, loading, sendCase } = useCases();
  const [result, setResult] = useState<CaseRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [paciente, setPaciente] = useState("");
  const [origen, setOrigen] = useState("urgencias");
  const [tipo, setTipo] = useState<"texto" | "imagen" | "pdf">("texto");
  const [prioridad, setPrioridad] = useState<"normal" | "alta">("normal");
  const [texto, setTexto] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  function fillForm(tc: (typeof testCases)[0]) {
    setPaciente(tc.paciente);
    setOrigen(tc.origen);
    setTipo(tc.tipo);
    setPrioridad(tc.prioridad);
    setTexto(tc.texto);
    if ("imagen" in tc && tc.imagen) setImagenUrl(tc.imagen as string);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const payload: CasePayload = {
      paciente_id: paciente,
      tipo_documento: tipo,
      texto,
      prioridad,
      origen,
    };
    if (tipo === "imagen" && imagenUrl) payload.imagen_url = imagenUrl;

    try {
      const caso = await sendCase(payload);
      setResult(caso);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    }
  }

  const recentCases = cases.slice(0, 5);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left column: form + quick cases */}
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-4 text-sm font-semibold">&#128203; Datos del Caso</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">ID Paciente</label>
                <input value={paciente} onChange={(e) => setPaciente(e.target.value)} required
                  placeholder="Ej: P-001"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Area / Servicio</label>
                <select value={origen} onChange={(e) => setOrigen(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400">
                  {Object.entries(origenLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Tipo de Documento</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400">
                  <option value="texto">Texto clinico</option>
                  <option value="imagen">Imagen medica</option>
                  <option value="pdf">Documento PDF</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Prioridad</label>
                <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400">
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
            {tipo === "imagen" && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-slate-400">URL de Imagen Medica</label>
                <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} type="url" placeholder="https://..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400" />
              </div>
            )}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-400">Descripcion Clinica</label>
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} required rows={4}
                placeholder="Ingrese la informacion clinica del paciente..."
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400" />
            </div>
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 disabled:translate-y-0 disabled:opacity-50">
              {loading ? <><span className="spinner" /> Analizando...</> : <>&#9654; Solicitar Analisis IA</>}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Quick cases */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-3 text-sm font-semibold">&#9889; Casos de Ejemplo</h3>
          <p className="mb-3 text-xs text-slate-400">Pre-cargar un caso para probar el sistema:</p>
          <div className="flex flex-col gap-1.5">
            {testCases.map((tc, i) => (
              <button key={i} onClick={() => fillForm(tc)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-left text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200">
                <span style={{ color: tc.prioridad === "alta" ? "#fb923c" : "#4ade80" }}>&#9679;</span>
                {tc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column: result + recent */}
      <div className="space-y-5">
        {loading ? (
          <div className="rounded-xl border border-indigo-900 bg-slate-950 p-6">
            <div className="flex items-center gap-3 text-indigo-400">
              <span className="spinner" />
              <div>
                <div className="font-semibold">Analizando caso clinico...</div>
                <div className="mt-1 text-xs text-slate-500">El sistema esta procesando la informacion con IA</div>
              </div>
            </div>
          </div>
        ) : (
          <ResultPanel caso={result} />
        )}

        {/* Recent cases */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-3 text-sm font-semibold">&#128200; Ultimos Enviados</h3>
          {recentCases.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">Sin casos enviados aun</div>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                  <div>
                    <span className="text-sm font-semibold">{c.paciente_id}</span>
                    <span className="ml-2 text-xs text-slate-500">{origenLabels[c.origen] || c.origen} - {c.latency}ms</span>
                  </div>
                  <Badge variant={c.estado === "resuelto" ? "auto" : c.riesgo === "critico" ? "critico" : "revision"}>
                    {c.estado === "resuelto" ? "resuelto" : c.riesgo}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
