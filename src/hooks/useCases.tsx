import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { CaseRecord, CasePayload, PipelineResponse } from "@/lib/api";
import { submitCase, classifyRisk, classifyEstado } from "@/lib/api";

interface CasesContextValue {
  cases: CaseRecord[];
  loading: boolean;
  sendCase: (payload: CasePayload) => Promise<CaseRecord>;
}

const CasesContext = createContext<CasesContextValue | null>(null);

const STORAGE_KEY = "medassist_cases";

function loadCases(): CaseRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCases(cases: CaseRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.slice(0, 100)));
}

export function CasesProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>(loadCases);
  const [loading, setLoading] = useState(false);

  const sendCase = useCallback(async (payload: CasePayload): Promise<CaseRecord> => {
    setLoading(true);
    try {
      const { data, latency } = await submitCase(payload);

      const riesgo = data?.nivel_riesgo || classifyRisk(payload.texto, payload.prioridad);
      const estado = data?.decision
        ? (/auto/.test(data.decision) ? "resuelto" as const : "revision" as const)
        : classifyEstado(riesgo);

      const caso: CaseRecord = {
        id: data?.caso_id || "MC-" + Date.now(),
        paciente_id: payload.paciente_id,
        tipo_documento: payload.tipo_documento,
        texto: payload.texto,
        prioridad: payload.prioridad,
        origen: payload.origen,
        timestamp: new Date().toISOString(),
        latency,
        response: data,
        riesgo,
        estado,
        confianza: data?.confianza_score ?? null,
      };

      setCases((prev) => {
        const next = [caso, ...prev];
        saveCases(next);
        return next;
      });

      return caso;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CasesContext.Provider value={{ cases, loading, sendCase }}>
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error("useCases must be used within CasesProvider");
  return ctx;
}
