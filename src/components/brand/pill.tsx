export function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-espresso/15 bg-white px-3.5 py-1.5 text-xs font-medium tracking-wide text-espresso ${className}`}
    >
      {children}
    </span>
  );
}
