export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-soft-blush uppercase">
      <span className="size-1.5 rounded-full bg-soft-blush" />
      {children}
    </span>
  );
}
