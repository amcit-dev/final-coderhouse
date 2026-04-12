const API_URL = "https://n8n.srv1009672.hstgr.cloud/webhook/healthcare-v2";
const SHEETS_ID = "1pD_ZBL7P1j8Zd8NtsDHyTKRg1wdJ1OO6z21tjS01sK0";

export const SHEETS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=Logs`;
export const SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/edit`;

export interface CasePayload {
  paciente_id: string;
  tipo_documento: "texto" | "imagen" | "pdf";
  texto: string;
  prioridad: "normal" | "alta";
  origen: string;
  imagen_url?: string;
  pdf_base64?: string;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface PipelineResponse {
  caso_id?: string;
  paciente_id?: string;
  tipo_caso?: string;
  hallazgos?: string | string[];
  nivel_riesgo?: string;
  recomendacion?: string;
  confianza_score?: number;
  decision?: string;
  respuesta_final?: string;
  latencia_total_ms?: number;
  eval_score_global?: number;
  eval_sugerencia?: string;
  razonamiento?: string;
}

export interface CaseRecord {
  id: string;
  paciente_id: string;
  tipo_documento: string;
  texto: string;
  prioridad: string;
  origen: string;
  timestamp: string;
  latency: number;
  response: PipelineResponse | null;
  riesgo: string;
  estado: "resuelto" | "revision";
  confianza: number | null;
}

export async function submitCase(payload: CasePayload): Promise<{ data: PipelineResponse | null; latency: number }> {
  const t0 = Date.now();
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const latency = Date.now() - t0;

  if (!resp.ok) throw new Error(`Error del servidor (${resp.status})`);

  let data: PipelineResponse | null = null;
  try {
    data = await resp.json();
  } catch {
    // response may not be JSON
  }

  return { data, latency };
}

export function classifyRisk(texto: string, prioridad: string): string {
  const t = texto.toLowerCase();
  if (/infarto|suicid|hiperkale|paro card|shock|parada/.test(t)) return "critico";
  if (/carcinoma|cancer|interaccion.*warfarina|derrame|tumor/.test(t)) return "alto";
  if (prioridad === "alta") return "moderado";
  return "bajo";
}

export function classifyEstado(riesgo: string): "resuelto" | "revision" {
  if (riesgo === "critico" || riesgo === "alto") return "revision";
  return "resuelto";
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = "";
  let inQ = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cell += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") { cur.push(cell); cell = ""; }
      else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        cur.push(cell); cell = ""; rows.push(cur); cur = [];
        if (ch === "\r") i++;
      } else cell += ch;
    }
  }
  if (cell || cur.length) { cur.push(cell); rows.push(cur); }
  return rows;
}

export const riskColors: Record<string, string> = {
  critico: "#f87171",
  alto: "#fb923c",
  moderado: "#fbbf24",
  bajo: "#4ade80",
};

export const origenLabels: Record<string, string> = {
  urgencias: "Urgencias",
  laboratorio: "Laboratorio",
  laboratorio_urgente: "Lab. Urgente",
  radiologia: "Radiologia",
  patologia: "Patologia",
  farmacia: "Farmacia",
  consulta_ambulatoria: "Consulta Amb.",
  pediatria: "Pediatria",
  salud_mental: "Salud Mental",
};
