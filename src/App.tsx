import { Routes, Route, Navigate } from "react-router-dom";
import { CasesProvider } from "@/hooks/useCases";
import Layout from "@/components/Layout";
import NuevoCaso from "@/pages/NuevoCaso";
import MisCasos from "@/pages/MisCasos";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <CasesProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<NuevoCaso />} />
          <Route path="/casos" element={<MisCasos />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </CasesProvider>
  );
}
