
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-border">
              <Image
                src="/psp-logo.jpg"
                alt="Plateau State Polytechnic crest"
                width={32}
                height={32}
                className="h-full w-full rounded-full object-contain"
              />
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-medium">
                Plateau State Polytechnic
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Attendance Management System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex w-full gap-2 sm:w-auto">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Link href="/login">Sign in</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Link href="/signup">Create account</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Technology for Progress
          </span>

          <h1 className="mt-5 text-balance font-display text-3xl font-medium leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Attendance, tracked properly — for every classroom at PSP.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Students request their courses, lecturers approve and mark
            attendance, and everyone — student, lecturer, and administrator —
            can see exactly where things stand.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-y border-border bg-muted/40 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-xl font-medium sm:text-2xl">
            Three roles, one system
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Everyone signs up on the same form and picks their role — the
            system takes care of the rest.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_CARDS.map(({ icon: Icon, title, points }) => (
              <Card
                key={title}
                className="h-full transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>

                  <CardTitle className="mt-2 text-base">
                    {title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ul className="grid gap-3 text-sm leading-6 text-muted-foreground">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-xl font-medium sm:text-2xl">
          How it works
        </h2>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                  {i + 1}
                </span>

                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <h3 className="font-medium">{title}</h3>

              <p className="text-sm leading-6 text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Matric Number */}
      <section className="border-t border-border bg-muted/40 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-xl font-medium sm:text-2xl">
            Your matric number
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Students sign up with their registered matric number, in this
            format:
          </p>

          {/* Matric example */}
          <div className="mt-5 max-w-full overflow-x-auto">
            <div className="inline-flex min-w-max items-center rounded-lg border border-border bg-card px-4 py-3 font-mono text-xs sm:text-sm">
              {MATRIC_NUMBER_EXAMPLE}
            </div>
          </div>

          {/* Matric breakdown */}
          <div className="mt-6 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            <p>
              <span className="font-medium text-foreground">PSP</span> —
              Plateau State Polytechnic
            </p>

            <p>
              <span className="font-medium text-foreground">ICT</span> —
              School
            </p>

            <p>
              <span className="font-medium text-foreground">CSC</span> —
              Department
            </p>

            <p>
              <span className="font-medium text-foreground">ND</span> —
              Programme (ND or HND)
            </p>

            <p>
              <span className="font-medium text-foreground">25</span> —
              Admission year
            </p>

            <p>
              <span className="font-medium text-foreground">0003</span> —
              Serial number
            </p>
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
            Signing up creates your account — it doesn’t enrol you in a
            course yet. After signing up, request the courses you’re
            registered for, and your lecturer will approve the request before
            it counts toward attendance.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground sm:px-6 sm:py-10">
        Plateau State Polytechnic · Technology for Progress
      </footer>
    </div>
  );
}
