export function DailyBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex h-28 items-end gap-1">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="group flex flex-1 flex-col items-center gap-1.5">
          <div
            title={`${d.label}: ${d.value}`}
            className="w-full rounded-t-md bg-soft-blush/70 transition-colors group-hover:bg-soft-blush"
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
          />
          <span className="text-[10px] whitespace-nowrap text-espresso/40">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
