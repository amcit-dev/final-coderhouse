interface KpiCardProps {
  value: string | number;
  label: string;
  color: "sky" | "green" | "orange" | "purple" | "red";
}

const colorMap = {
  sky: "text-sky-400",
  green: "text-emerald-400",
  orange: "text-orange-400",
  purple: "text-violet-400",
  red: "text-red-400",
};

export default function KpiCard({ value, label, color }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
      <div className={`text-3xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
