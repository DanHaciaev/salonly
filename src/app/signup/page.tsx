import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <Link href="/" className="mb-8 font-heading text-2xl text-espresso">
        salonly
      </Link>
      <Card className="w-full max-w-sm p-2">
        <CardContent className="px-6 py-4">
          <h1 className="font-heading text-2xl text-espresso">Создать салон</h1>
          <p className="mt-1 mb-6 text-sm text-espresso/60">
            Бесплатно, без карты — страница записи будет готова за пару минут
          </p>
          <SignupForm defaultEmail={email} />
        </CardContent>
      </Card>
      <p className="mt-6 text-sm text-espresso/60">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-soft-blush hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
