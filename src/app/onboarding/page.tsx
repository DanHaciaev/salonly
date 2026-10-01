import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const business = await getCurrentBusiness();
  if (business) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <span className="mb-8 font-heading text-2xl text-espresso">salonly</span>
      <Card className="w-full max-w-sm p-2">
        <CardContent className="px-6 py-4">
          <h1 className="font-heading text-2xl text-espresso">Последний шаг</h1>
          <p className="mt-1 mb-6 text-sm text-espresso/60">
            Название и ссылка — остальное (лого, услуги, мастеров) добавите в CRM
          </p>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
