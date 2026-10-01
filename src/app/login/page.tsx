import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <Link href="/" className="mb-8 font-heading text-2xl text-espresso">
        salonly
      </Link>
      <Card className="w-full max-w-sm p-2">
        <CardContent className="px-6 py-4">
          <h1 className="font-heading text-2xl text-espresso">С возвращением</h1>
          <p className="mt-1 mb-6 text-sm text-espresso/60">
            Войдите, чтобы управлять своим салоном
          </p>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-6 text-sm text-espresso/60">
        Ещё нет аккаунта?{" "}
        <Link href="/signup" className="font-medium text-soft-blush hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
