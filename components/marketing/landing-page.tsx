import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  CalendarCheck,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MATRIC_NUMBER_EXAMPLE } from "@/lib/validations";

const ROLE_CARDS = [
  {
    icon: ShieldCheck,
    title: "Administrator",
    points: [
      "Creates courses and assigns lecturers",
      "Manages student and lecturer accounts",
      "Reviews attendance reports across the institution",
    ],
  },
  {
    icon: Users,
    title: "Lecturer",
    points: [
      "Approves student requests to join their course",
      "Takes attendance for each class session",
      "Reviews attendance history for their courses",
    ],
  },
  {
    icon: GraduationCap,
    title: "Student",
    points: [
      "Signs up with a matric number and requests courses",
      "Views attendance history and percentage per course",
      "Sees exam eligibility based on 75% attendance",
    ],
  },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Sign up",
    body: "Create an account as a student, lecturer, or administrator. Students register with their matric number.",
  },
  {
    icon: CalendarCheck,
    title: "Request or assign a course",
    body: "Students request to join a course; the lecturer approves the request before it counts.",
  },
  {
    icon: BarChart3,
    title: "Track attendance",
    body: "Lecturers mark each session; students and admins see attendance percentage and trends in real time.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border">
              <Image src="/psp-logo.jpg" alt="Plateau State Polytechnic crest" width={32} height={32} className="h-full w-full rounded-full object-contain" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-medium">Plateau State Polytechnic</p>
              <p className="text-[11px] text-muted-foreground">Attendance Management System</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Create account</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Technology for Progress
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">
            Attendance, tracked properly — for every classroom at PSP.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Students request their courses, lecturers approve and mark attendance, and everyone —
            student, lecturer, and administrator — can see exactly where things stand.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-medium">Three roles, one system</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Everyone signs up on the same form and picks their role — the system takes care of the rest.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {ROLE_CARDS.map(({ icon: Icon, title, points }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="mt-2 text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                  {i + 1}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-medium">Your matric number</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Students sign up with their registered matric number, in this format:
          </p>
          <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm">
            {MATRIC_NUMBER_EXAMPLE}
          </div>
          <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <p><span className="font-medium text-foreground">PSP</span> — Plateau State Polytechnic</p>
            <p><span className="font-medium text-foreground">ICT</span> — School</p>
            <p><span className="font-medium text-foreground">CSC</span> — Department</p>
            <p><span className="font-medium text-foreground">ND</span> — Programme (ND or HND)</p>
            <p><span className="font-medium text-foreground">25</span> — Admission year</p>
            <p><span className="font-medium text-foreground">0003</span> — Serial number</p>
          </div>
          <p className="mt-5 max-w-xl text-sm text-muted-foreground">
            Signing up creates your account — it doesn’t enrol you in a course yet. After signing up,
            request the courses you’re registered for, and your lecturer will approve the request before
            it counts toward attendance.
          </p>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        Plateau State Polytechnic · Technology for Progress
      </footer>
    </div>
  );
}
