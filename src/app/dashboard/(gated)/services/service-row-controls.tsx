"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteService, toggleServiceActive } from "./actions";

export function ServiceActiveSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <Switch
      checked={isActive}
      onCheckedChange={(checked) => toggleServiceActive(id, checked)}
    />
  );
}

export function DeleteServiceButton({ id }: { id: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => {
        if (confirm("Удалить услугу безвозвратно?")) deleteService(id);
      }}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
