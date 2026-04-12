interface BadgeProps {
  variant: "auto" | "revision" | "critico" | "normal" | "alta" | "pendiente";
  children: React.ReactNode;
}

const styles: Record<string, string> = {
  auto: "bg-emerald-950 text-emerald-400",
  revision: "bg-orange-950 text-orange-400",
  critico: "bg-red-950 text-red-400",
  normal: "border border-slate-700 bg-slate-800 text-slate-400",
  alta: "bg-orange-950 text-orange-400",
  pendiente: "bg-indigo-950 text-indigo-400",
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${styles[variant] || styles.normal}`}>
      {children}
    </span>
  );
}
