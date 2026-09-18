# Plateau State Polytechnic — Student Attendance Management System

A web-based attendance system built as a case study for Plateau State Polytechnic.
Students sign up and request their courses, lecturers approve those requests and
take attendance per class session, and everyone — student, lecturer, and
administrator — can see exactly where attendance stands.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
shadcn/ui · React Hook Form · Zod · Supabase (Auth + Postgres) · Recharts · pnpm · Vercel

The institution's crest (`public/psp-logo.jpg`) is used as the sidebar mark, the
login/signup mark, and the site favicon (`app/icon.png`) — swap that file to
rebrand for a different institution.

---

## Contents

1. [How the system works](#how-the-system-works)
2. [Roles and navigation](#roles-and-navigation)
3. [Matric number format](#matric-number-format)
4. [Installation](#installation)
5. [Running it](#running-it)
6. [Deploying](#deploying)
7. [Project structure](#project-structure)
8. [Security model](#security-model)
9. [Extending this scaffold](#extending-this-scaffold)

---

## How the system works

1. **Everyone signs up on the same form** (`/signup`), picking a role — Student,
   Lecturer, or Administrator. Landing on `/` first explains the concept and links
   to sign up or sign in.
2. **Signing up creates an account — it doesn't enrol a student in anything yet.**
   A student's matric number is captured at signup and stored on their profile.
3. **Students request courses.** From `/student/register`, a student browses
   available courses and requests to join one. The request starts as **pending**.
4. **Lecturers approve or reject requests** for their own courses, from
   `/lecturer/enrollments` — one at a time or several at once (bulk approve/reject,
   useful for a large class). Administrators can also approve/reject any request,
   system-wide, as a backstop.
5. **Only approved students appear on the attendance sheet.** A lecturer picks a
   course and date at `/lecturer/attendance`; the class list is exactly the
   students currently approved for that course.
6. **Attendance rolls up automatically.** Students see their attendance
   percentage per course, an exam-eligibility flag (Plateau State Polytechnic,
   like most Nigerian polytechnics, requires at least 75% attendance to sit an
   exam), and a trend chart of their attendance over time. Administrators see the
   same, institution-wide, in Reports.

## Roles and navigation

### Administrator (`/admin`)
- **Overview** — institution-wide stats and a list of students below the 75%
  attendance threshold.
- **Students** / **Lecturers** — add, edit, remove accounts directly (in addition
  to people self-registering at `/signup`); search by name, matric number, or
  email; export the list as CSV, Excel, or print/PDF.
- **Courses** — create courses, assign a lecturer, and export a per-course class
  roster (name + matric number) for exam invigilation or physical sign-in sheets.
- **Enrollments** — every enrollment request, system-wide, with its status
  (pending/approved/rejected); approve, reject, or enrol a student directly.
- **Reports** — attendance rate by course, an institution-wide attendance trend
  chart, and an exportable detail table.
- **Sign out** — click your avatar (top right) → Sign out. Available on every
  admin page.

### Lecturer (`/lecturer`)
- **My Courses** — the courses you're assigned to teach, each showing your
  approved student count, a "pending requests" badge if any are waiting, a button
  to take attendance, and a roster export.
- **Take Attendance** — pick a course and date (a session is created
  automatically the first time you open a date), then mark each student
  Present/Late/Absent. Search by name or matric number to jump to a student in a
  large class. "Mark all present/absent" speeds up the common case; re-opening
  the same course/date later loads what was already saved so you can correct it.
- **Enrollment Requests** — approve or reject students requesting your courses,
  individually or in bulk (select several, then "Approve selected").
- **Sign out** — same as above, via your avatar menu.

### Student (`/student`)
- **Overview** — attendance percentage per course, an exam-eligibility flag
  (green = eligible, red = below 75%), and a trend chart of your attendance over
  time. A banner appears if you have requests still awaiting approval.
- **Register for Courses** — browse all courses and request to join one; see
  the status of each request (not requested / pending / enrolled / rejected);
  withdraw a pending request, or re-request after a rejection.
- **Attendance History** — every recorded session across your courses, with
  CSV/Excel/PDF export.
- **Sign out** — same as above.

## Matric number format

Students sign up with their registered matric number, in this format:

```
PSP/ICT/CSC/ND/25/0003
```

| Segment | Meaning |
|---|---|
| `PSP` | Plateau State Polytechnic |
| `ICT` | School (e.g. School of Information & Communication Technology) |
| `CSC` | Department (e.g. Computer Science) |
| `ND` | Programme — `ND` or `HND` |
| `25` | Admission year |
| `0003` | Serial number |

This is validated on the signup form (see `matricNumberPattern` in
`lib/validations.ts`) — adjust the regex there if your institution's format
differs.

## Installation

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **Publishable key** (`sb_publishable_...`) — the modern replacement for the
     old "anon" key
   - **Secret key** (`sb_secret_...`) — the modern replacement for the old
     "service_role" key

   If your project still shows the legacy anon/service_role naming, the
   Supabase dashboard has a toggle to switch to the new publishable/secret key
   system — this app is written against the new naming.

3. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

`ADMIN_SIGNUP_CODE` is a secret you choose — anyone who selects the "Admin" tab
on `/signup` must type this code to succeed, so only people you've told the
code to can create an administrator account. Set it to something private before
you deploy.

### 3. Set up the database

Open the **SQL Editor** in your Supabase project and run the contents of
[`supabase/schema.sql`](./supabase/schema.sql). This creates every table,
enables Row Level Security with policies for each role and each enrollment
action (request / approve / reject / withdraw), and adds the reporting
functions the dashboards use. It's safe to re-run.

### 4. (Optional) Create a first administrator by hand

You don't strictly need this — anyone can self-register as an administrator at
`/signup` by entering the `ADMIN_SIGNUP_CODE` from your `.env.local`. If you'd
rather create the very first admin directly in Supabase instead:

1. **Authentication → Users → Add user** — create a user with an email and
   password, and confirm the email.
2. In the **SQL Editor**, insert their profile row:

```sql
insert into profiles (id, full_name, email, role)
values ('<paste the user''s UUID from the Users table>', 'Your Name', 'you@pspoly.edu.ng', 'admin');
```

### 5. Confirm your Supabase email settings

By default, Supabase requires email confirmation before a new account can sign
in. For local development you can either:
- Turn off "Confirm email" under **Authentication → Providers → Email** (fastest
  for testing), or
- Leave it on and check the inbox for each signup's confirmation link (closer to
  production behaviour).

## Running it

```bash
pnpm dev      # start the dev server at http://localhost:3000
pnpm build    # production build
pnpm start    # run the production build
pnpm lint     # lint
```

## Deploying

Push to a Git repository and import it into [Vercel](https://vercel.com). Add
the same environment variables from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`,
`ADMIN_SIGNUP_CODE`) in the Vercel project settings. Vercel builds with `pnpm`
automatically when it detects `pnpm-lock.yaml`.

## Project structure

```
app/
  page.tsx                Public landing page (redirects signed-in users to their dashboard)
  (auth)/login/            Sign-in page
  (auth)/signup/           Unified sign-up (Student / Lecturer / Admin tabs)
  admin/                   Admin dashboard, students, lecturers, courses, enrollments, reports
  lecturer/                 Lecturer's courses, attendance-taking, enrollment approval queue
  student/                  Student's overview, course registration, attendance history
components/
  ui/                       Hand-built shadcn/ui primitives (button, dialog, table, form, ...)
  layout/                   Sidebar + header shared across role dashboards
  marketing/                Landing page
  auth/                     Login form
  admin/, lecturer/, student/, shared/   Feature-specific components
lib/
  actions/                  Server actions (auth, signup, students, lecturers, courses,
                             enrollments, attendance)
  supabase/                 Browser, server, middleware, and admin Supabase clients
  validations.ts            Zod schemas for every form, incl. the matric number pattern
  database.types.ts         Hand-written types matching supabase/schema.sql
  export.ts                 CSV / Excel export helpers
supabase/schema.sql          Tables, RLS policies, reporting functions
```

## Security model

- The browser only ever uses the **publishable key**, and every table has Row
  Level Security enabled — see `supabase/schema.sql` for the exact policies.
  For example: a student can only read their own attendance rows and can only
  insert their own enrollment request (which must start `pending`); a lecturer
  can only approve/reject/mark attendance for courses they teach; only an
  admin — or the student themself — can move a rejected request back to
  pending.
- The **secret key** is used in exactly one place, `lib/supabase/admin.ts`, and
  only from Server Actions — never imported into a Client Component — to create
  auth accounts when an admin adds a student or lecturer directly.
- Self-registered accounts (student/lecturer) need no special permission.
  Self-registering as an **administrator** requires `ADMIN_SIGNUP_CODE`, checked
  server-side only — the code is never sent to the browser, so it can't be read
  out of the page source.
- Accounts created by an admin (rather than self-signup) get a random temporary
  password and are immediately sent a password-reset email, so no one but the
  account owner ever knows their password.

## Extending this scaffold

- **Forgot-password link** on the login page, using Supabase's password-reset
  email flow (`supabase.auth.resetPasswordForEmail`), already used internally
  when an admin creates an account.
- **Audit trail for attendance edits** — log who changed a record and when, so
  a dispute ("I was marked absent but I was there") has an answer.
- **QR / self check-in** — a lecturer displays a short-lived code; a student
  scans it to mark themselves present within a time window. More build effort
  than the rest of this list, and needs care to stop one student checking in for
  another (e.g. require they're on campus wifi, or already logged in on that
  device).
- **Bulk CSV import for students** — batch-create accounts via the same
  `createStudent` server action, for onboarding a whole class at once.
- **Recurring class schedule** — instead of a lecturer picking a date freely
  each time, a course could have a set meeting pattern (e.g. Mon/Wed 10am) and
  the system prompts "today's session" automatically.
