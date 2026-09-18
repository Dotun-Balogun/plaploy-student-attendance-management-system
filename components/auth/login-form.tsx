"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: AuthFormState = {};

export function LoginForm({ justRegistered }: { justRegistered: boolean }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
          <CardDescription>Use the email and password you registered with.</CardDescription>
        </CardHeader>
        <CardContent>
          {justRegistered && (
            <p className="mb-4 rounded-md bg-present/10 px-3 py-2 text-sm text-present">
              Account created. If email confirmation is required you’ll get an email first — otherwise, sign in below.
            </p>
          )}
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@pspoly.edu.ng" required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {state?.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
        <br />
        Technology for Progress · Contact your administrator if you’ve forgotten your password.
      </p>
    </>
  );
}
