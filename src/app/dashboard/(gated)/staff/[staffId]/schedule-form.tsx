"use client";

import { useActionState, useMemo, useState } from "react";
import { updateStaffHours, type HoursFormState } from "./hours-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 0, label: "Воскресенье" },
];

const initialState: HoursFormState = {};

export function ScheduleForm({
  staffId,
  hours,
}: {
  staffId: string;
  hours: { day_of_week: number; start_time: string; end_time: string }[];
}) {
  const action = updateStaffHours.bind(null, staffId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const hoursByDay = useMemo(() => new Map(hours.map((h) => [h.day_of_week, h])), [hours]);

  const [enabled, setEnabled] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(DAYS.map((d) => [d.value, hoursByDay.has(d.value)]))
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {DAYS.map((day) => {
        const existing = hoursByDay.get(day.value);
        return (
          <div
            key={day.value}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-espresso/10 px-4 py-3"
          >
            <label className="flex w-40 shrink-0 items-center gap-2 text-sm text-espresso">
              <Checkbox
                name={`day_${day.value}_enabled`}
                checked={enabled[day.value]}
                onCheckedChange={(checked) =>
                  setEnabled((prev) => ({ ...prev, [day.value]: checked === true }))
                }
              />
              {day.label}
            </label>
            {enabled[day.value] ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  name={`day_${day.value}_start`}
                  defaultValue={existing?.start_time.slice(0, 5) ?? "09:00"}
                  className="w-28"
                />
                <span className="text-espresso/40">—</span>
                <Input
                  type="time"
                  name={`day_${day.value}_end`}
                  defaultValue={existing?.end_time.slice(0, 5) ?? "18:00"}
                  className="w-28"
                />
              </div>
            ) : (
              <span className="text-sm text-espresso/40">Выходной</span>
            )}
          </div>
        );
      })}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-soft-blush">Сохранено</p>}

      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить расписание"}
      </Button>
    </form>
  );
}
