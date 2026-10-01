"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  Star,
  Settings,
  Bell,
  ExternalLink,
  LogOut,
  Menu,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useSiteHost } from "@/hooks/use-site-host";
import type { Database } from "@/lib/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

const navItems = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "Записи", icon: CalendarDays },
  { href: "/dashboard/services", label: "Услуги", icon: Scissors },
  { href: "/dashboard/staff", label: "Мастера", icon: Users },
  { href: "/dashboard/reviews", label: "Отзывы", icon: Star },
  { href: "/dashboard/notifications", label: "Уведомления", icon: Bell },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

function SidebarContent({ business, onNavigate }: { business: Business; onNavigate?: () => void }) {
  const pathname = usePathname();
  const host = useSiteHost();

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <div className="mb-8 px-2">
        <p className="font-heading text-xl">{business.name}</p>
        <Link
          href={`/${business.slug}`}
          target="_blank"
          className="mt-1 inline-flex items-center gap-1 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          {host}/{business.slug} <ExternalLink className="size-3" />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
          Выйти
        </button>
      </form>
    </div>
  );
}

export function DashboardShell({
  business,
  children,
}: {
  business: Business;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden w-64 shrink-0 overflow-y-auto bg-sidebar text-sidebar-foreground lg:block">
        <SidebarContent business={business} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 border-none bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Меню</SheetTitle>
          <SidebarContent business={business} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-espresso/10 bg-background px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Открыть меню"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <span className="font-heading text-lg text-espresso">{business.name}</span>
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
