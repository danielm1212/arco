"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Logowanie…" : "Zaloguj"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-md">
      <div className="w-full max-w-sm space-y-xl">
        <div className="space-y-2xs text-center">
          <h1 className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Arco" className="h-10 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="" aria-hidden className="hidden h-10 w-auto dark:block" />
          </h1>
          <p className="text-sm text-muted-foreground">Zaloguj się, żeby trenować.</p>
        </div>

        <form action={formAction} className="space-y-md">
          <div className="space-y-xs">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              inputMode="email"
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="password" className="text-sm font-medium">
              Hasło
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
