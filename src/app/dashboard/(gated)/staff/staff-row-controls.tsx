"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteStaff, toggleStaffActive } from "./actions";

export function StaffActiveSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  return <Switch checked={isActive} onCheckedChange={(checked) => toggleStaffActive(id, checked)} />;
}

export function DeleteStaffButton({ id }: { id: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => {
        if (confirm("Удалить мастера вместе с его портфолио?")) deleteStaff(id);
      }}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
