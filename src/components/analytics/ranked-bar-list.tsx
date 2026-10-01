export function RankedBarList({
  items,
  emptyLabel,
}: {
  items: { label: string; value: number }[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-espresso/50">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-espresso/70">{item.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-soft-blush"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-sm font-medium text-espresso">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
