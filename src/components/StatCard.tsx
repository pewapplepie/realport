interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-[#477A87]"
      : trend === "down"
        ? "text-rose-700"
        : "text-stone-500";

  return (
    <div className="rounded-xl border border-stone-200 bg-white/90 p-6 shadow-[0_14px_40px_rgba(23,32,25,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{title}</p>
        {icon && <div className="text-stone-400">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-semibold text-stone-950">{value}</p>
      {subtitle && (
        <p className={`mt-1 text-sm ${trendColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
