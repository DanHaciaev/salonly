import { Slot } from "radix-ui";

export function Pill({
  children,
  className = "",
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      className={`inline-flex items-center gap-1.5 rounded-full border border-espresso/15 bg-white px-3.5 py-1.5 text-xs font-medium tracking-wide text-espresso transition-colors hover:border-espresso/30 ${className}`}
    >
      {children}
    </Comp>
  );
}
