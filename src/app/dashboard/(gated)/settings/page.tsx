import { getCurrentBusiness } from "@/lib/business";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const business = await getCurrentBusiness();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Настройки салона</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Это видят клиенты на странице бронирования
        </p>
      </div>
      <SettingsForm business={business!} />
    </div>
  );
}
