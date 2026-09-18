"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signupStudent, signupLecturer, signupAdmin, type SignupFormState } from "@/lib/actions/signup";
import { MATRIC_NUMBER_EXAMPLE } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState: SignupFormState = {};

export default function SignupPage() {
  const [studentState, studentAction, studentPending] = useActionState(signupStudent, initialState);
  const [lecturerState, lecturerAction, lecturerPending] = useActionState(signupLecturer, initialState);
  const [adminState, adminAction, adminPending] = useActionState(signupAdmin, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/60 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-sm ring-1 ring-border">
            <Image src="/psp-logo.jpg" alt="Plateau State Polytechnic crest" width={56} height={56} className="h-full w-full object-contain" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium">Create your account</h1>
            <p className="text-sm text-muted-foreground">Plateau State Polytechnic · Attendance Management System</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign up</CardTitle>
            <CardDescription>Students, lecturers, and administrators all register here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form action={studentAction} className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-full_name">Full name</Label>
                    <Input id="s-full_name" name="full_name" placeholder="Amara Okafor" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-student_id">Matric number</Label>
                    <Input id="s-student_id" name="student_id" placeholder={MATRIC_NUMBER_EXAMPLE} required className="font-mono uppercase placeholder:normal-case" />
                    <p className="text-xs text-muted-foreground">
                      Format: <span className="font-mono">{MATRIC_NUMBER_EXAMPLE}</span> — Institution / School / Department / Programme (ND or HND) / Year / Serial number.
                    </p>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-email">Email</Label>
                    <Input id="s-email" name="email" type="email" placeholder="amara.okafor@pspoly.edu.ng" required autoComplete="email" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-password">Password</Label>
                    <Input id="s-password" name="password" type="password" required autoComplete="new-password" minLength={6} />
                  </div>
                  {studentState?.error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{studentState.error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={studentPending}>
                    {studentPending ? "Creating account…" : "Create student account"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Creating your account doesn’t enrol you in courses yet — your administrator will add you to your
                    registered courses once you’ve signed up.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="lecturer">
                <form action={lecturerAction} className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="l-full_name">Full name</Label>
                    <Input id="l-full_name" name="full_name" placeholder="Dr. Femi Adeyemi" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="l-email">Email</Label>
                    <Input id="l-email" name="email" type="email" placeholder="femi.adeyemi@pspoly.edu.ng" required autoComplete="email" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="l-password">Password</Label>
                    <Input id="l-password" name="password" type="password" required autoComplete="new-password" minLength={6} />
                  </div>
                  {lecturerState?.error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{lecturerState.error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={lecturerPending}>
                    {lecturerPending ? "Creating account…" : "Create lecturer account"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your administrator will assign your courses after you sign up.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form action={adminAction} className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="a-full_name">Full name</Label>
                    <Input id="a-full_name" name="full_name" placeholder="Your name" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="a-email">Email</Label>
                    <Input id="a-email" name="email" type="email" placeholder="you@pspoly.edu.ng" required autoComplete="email" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="a-password">Password</Label>
                    <Input id="a-password" name="password" type="password" required autoComplete="new-password" minLength={6} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="a-invite_code">Administrator invite code</Label>
                    <Input id="a-invite_code" name="invite_code" type="password" required />
                    <p className="text-xs text-muted-foreground">Ask your system owner for this code.</p>
                  </div>
                  {adminState?.error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{adminState.error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={adminPending}>
                    {adminPending ? "Creating account…" : "Create administrator account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
