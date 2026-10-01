"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { getAvailableSlotsAction, createBooking } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import type { Database, NotifyChannel } from "@/lib/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"];

const steps = ["Услуга", "Мастер", "Время", "Контакты"];

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingWizard({
  slug,
  businessId,
  services,
  staff,
  initialServiceId,
  initialStaffId,
}: {
  slug: string;
  businessId: string;
  services: Service[];
  staff: Staff[];
  initialServiceId?: string;
  initialStaffId?: string;
}) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [staffId, setStaffId] = useState(initialStaffId ?? "");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notifyChannel, setNotifyChannel] = useState<NotifyChannel>("email");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ error?: string; success?: boolean; telegramLink?: string } | null>(
    null
  );

  const service = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);

  useEffect(() => {
    if (!date || !staffId || !service) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with the server-computed slot list for the selected date/staff/service
    setLoadingSlots(true);
    setTime("");
    getAvailableSlotsAction(businessId, staffId, service.duration_minutes, toDateKey(date))
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [date, staffId, service, businessId]);

  async function handleSubmit() {
    setSubmitting(true);
    const res = await createBooking({
      slug,
      serviceId,
      staffId,
      date: date ? toDateKey(date) : "",
      time,
      name,
      phone,
      email: email || undefined,
      notifyChannel,
    });
    setSubmitting(false);
    setResult(res);
  }

  if (result?.success) {
    return (
      <Card className="mx-auto max-w-md p-2">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-soft-blush/15 text-soft-blush">
            <Check className="size-7" />
          </div>
          <h2 className="font-heading text-2xl text-espresso">Вы записаны!</h2>
          <p className="text-sm text-espresso/60">
            {date && `${date.toLocaleDateString("ru-RU")} в ${time}`} — {service?.name}
          </p>
          {result.telegramLink && (
            <Button asChild className="mt-2">
              <a href={result.telegramLink} target="_blank" rel="noreferrer">
                <Send /> Подключить Telegram-уведомления
              </a>
            </Button>
          )}
          <Link href={`/${slug}`} className="mt-3 text-sm text-soft-blush hover:underline">
            Вернуться на страницу салона
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                i + 1 <= step ? "bg-espresso text-dusty-rose" : "bg-muted text-espresso/40"
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className="h-px w-6 bg-espresso/15" />}
          </div>
        ))}
      </div>

      <Card className="p-2">
        <CardContent className="px-6 py-6">
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl text-espresso">Выберите услугу</h2>
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                    serviceId === s.id
                      ? "border-soft-blush bg-soft-blush/10"
                      : "border-espresso/10 hover:border-espresso/30"
                  }`}
                >
                  <div>
                    <p className="font-medium text-espresso">{s.name}</p>
                    <p className="text-xs text-espresso/50">{s.duration_minutes} мин</p>
                  </div>
                  <span className="font-heading text-lg text-espresso">{s.price} ₽</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl text-espresso">Выберите мастера</h2>
              {staff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setStaffId(member.id)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                    staffId === member.id
                      ? "border-soft-blush bg-soft-blush/10"
                      : "border-espresso/10 hover:border-espresso/30"
                  }`}
                >
                  <Avatar className="size-10">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback>{member.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-espresso">{member.name}</p>
                    {member.title && <p className="text-xs text-espresso/50">{member.title}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-2xl text-espresso">Выберите дату и время</h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                className="mx-auto"
              />
              {date && (
                <div>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-espresso/50">
                      <Loader2 className="size-4 animate-spin" /> Загружаем свободное время…
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="py-6 text-center text-sm text-espresso/50">
                      На эту дату нет свободного времени
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTime(slot)}
                          className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                            time === slot
                              ? "border-soft-blush bg-soft-blush text-white"
                              : "border-espresso/15 text-espresso hover:border-espresso/40"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-2xl text-espresso">Ваши контакты</h2>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 900 000-00-00"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email (необязательно)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Как напомнить о записи?</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNotifyChannel("email")}
                    className={`flex-1 rounded-full border px-4 py-2 text-sm ${
                      notifyChannel === "email"
                        ? "border-soft-blush bg-soft-blush/10 text-espresso"
                        : "border-espresso/15 text-espresso/60"
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifyChannel("telegram")}
                    className={`flex-1 rounded-full border px-4 py-2 text-sm ${
                      notifyChannel === "telegram"
                        ? "border-soft-blush bg-soft-blush/10 text-espresso"
                        : "border-espresso/15 text-espresso/60"
                    }`}
                  >
                    Telegram
                  </button>
                </div>
              </div>
              {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft /> Назад
          </Button>
        ) : (
          <span />
        )}

        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 1 && !serviceId) ||
              (step === 2 && !staffId) ||
              (step === 3 && !time)
            }
          >
            Далее <ArrowRight />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting || !name || !phone}>
            {submitting ? "Записываем…" : "Подтвердить запись"}
          </Button>
        )}
      </div>
    </div>
  );
}
