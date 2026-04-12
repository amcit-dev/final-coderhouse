import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FileText, FolderOpen, BarChart3 } from "lucide-react";

const nav = [
  { to: "/", icon: FileText, label: "Nuevo Caso" },
  { to: "/casos", icon: FolderOpen, label: "Mis Casos" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
];

const titles: Record<string, [string, string]> = {
  "/": ["Nuevo Caso", "Ingrese los datos del paciente para obtener el analisis"],
  "/casos": ["Mis Casos", "Historial de analisis realizados"],
  "/dashboard": ["Dashboard", "Metricas generales del sistema"],
};

export default function Layout() {
  const { pathname } = useLocation();
  const [title, subtitle] = titles[pathname] || titles["/"];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-slate-700 bg-slate-800">
        <div className="border-b border-slate-700 px-5 py-5">
          <h1 className="flex items-center gap-2 text-lg font-bold text-sky-400">
            <span className="text-xl">&#9764;</span> MedAssist AI
          </h1>
          <p className="mt-1 text-xs text-slate-500">Asistente Clinico Inteligente</p>
        </div>

        <nav className="flex-1 py-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 border-l-[3px] px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-sky-400 bg-sky-400/[.08] text-sky-400"
                    : "border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 border-t border-slate-700 px-5 py-3 text-xs text-slate-500">
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-green-500 animate-pulse-dot" />
          Sistema activo
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-56 flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-7 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="text-xs text-slate-500">{subtitle}</span>
        </header>

        <main className="flex-1 p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
