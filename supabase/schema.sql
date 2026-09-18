-- ============================================================================
-- Plateau State Polytechnic — Student Attendance Management System
-- Supabase schema. Run this in the Supabase SQL editor (or via
-- `supabase db push`) on a fresh project. Safe to re-run: guarded with
-- IF NOT EXISTS / OR REPLACE wherever possible.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'lecturer', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status as enum ('present', 'absent', 'late');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enrollment_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per auth.users row. A trigger (handle_new_user, below) creates
-- this automatically on signup, whether the person self-registered or an
-- admin created the account.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'student',
  student_id text unique, -- matric number, e.g. PSP/ICT/CSC/ND/25/0003
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  lecturer_id uuid references profiles (id) on delete set null,
  semester text not null,
  created_at timestamptz not null default now()
);

-- A student requests a course; the lecturer (or an admin) approves or
-- rejects the request. Only 'approved' rows put a student on the class list
-- a lecturer sees when taking attendance.
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  status enrollment_status not null default 'pending',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references profiles (id) on delete set null,
  unique (course_id, student_id)
);

create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  session_date date not null,
  topic text,
  created_at timestamptz not null default now(),
  unique (course_id, session_date)
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  status attendance_status not null default 'present',
  marked_at timestamptz not null default now(),
  marked_by uuid references profiles (id) on delete set null,
  unique (session_id, student_id)
);

create index if not exists idx_courses_lecturer on courses (lecturer_id);
create index if not exists idx_enrollments_course on enrollments (course_id);
create index if not exists idx_enrollments_student on enrollments (student_id);
create index if not exists idx_enrollments_status on enrollments (status);
create index if not exists idx_sessions_course on class_sessions (course_id);
create index if not exists idx_attendance_session on attendance_records (session_id);
create index if not exists idx_attendance_student on attendance_records (student_id);

-- ---------------------------------------------------------------------------
-- Migration helper: if you already ran an earlier version of this schema
-- (enrollments without a status column), run this block once to upgrade in
-- place instead of dropping the table.
-- ---------------------------------------------------------------------------
do $$ begin
  alter table enrollments add column status enrollment_status not null default 'approved';
exception when duplicate_column then null; end $$;

do $$ begin
  alter table enrollments add column requested_at timestamptz not null default now();
exception when duplicate_column then null; end $$;

do $$ begin
  alter table enrollments add column decided_at timestamptz;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table enrollments add column decided_by uuid references profiles (id) on delete set null;
exception when duplicate_column then null; end $$;

-- ---------------------------------------------------------------------------
-- Helper functions (security definer, used inside RLS policies)
-- ---------------------------------------------------------------------------

create or replace function current_role_is(role_name user_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = role_name
  );
$$;

create or replace function is_admin()
returns boolean language sql security definer set search_path = public stable
as $$ select current_role_is('admin'); $$;

create or replace function teaches_course(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from courses
    where id = target_course_id and lecturer_id = auth.uid()
  );
$$;

create or replace function enrolled_in_course(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from enrollments
    where course_id = target_course_id and student_id = auth.uid() and status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table class_sessions enable row level security;
alter table attendance_records enable row level security;

-- profiles: everyone signed in can read names (needed for class lists,
-- lecturer names on courses, etc). Admins can write any row; a signed-in
-- user may update their own.
drop policy if exists "profiles_select_authenticated" on profiles;
create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);

drop policy if exists "profiles_insert_admin" on profiles;
create policy "profiles_insert_admin" on profiles
  for insert to authenticated with check (is_admin());

drop policy if exists "profiles_update_admin_or_self" on profiles;
create policy "profiles_update_admin_or_self" on profiles
  for update to authenticated using (is_admin() or id = auth.uid());

drop policy if exists "profiles_delete_admin" on profiles;
create policy "profiles_delete_admin" on profiles
  for delete to authenticated using (is_admin());

-- courses: readable by everyone signed in; writable by admins only.
drop policy if exists "courses_select_authenticated" on courses;
create policy "courses_select_authenticated" on courses
  for select to authenticated using (true);

drop policy if exists "courses_write_admin" on courses;
create policy "courses_write_admin" on courses
  for all to authenticated using (is_admin()) with check (is_admin());

-- enrollments: readable by everyone signed in (class lists, "my requests").
-- Writes are split by action:
--  - insert: an admin can create any row (e.g. instant-approve); a student
--    can only create their own row, and it must start out 'pending'.
--  - update: an admin or the course's lecturer can approve/reject any row
--    for that course; a student may only move their own 'rejected' row back
--    to 'pending' (re-requesting after a rejection).
--  - delete: an admin or the course's lecturer can remove any row; a
--    student may withdraw their own request while it's still 'pending'.
drop policy if exists "enrollments_select_authenticated" on enrollments;
create policy "enrollments_select_authenticated" on enrollments
  for select to authenticated using (true);

drop policy if exists "enrollments_write_admin" on enrollments;
drop policy if exists "enrollments_insert" on enrollments;
create policy "enrollments_insert" on enrollments
  for insert to authenticated
  with check (
    is_admin()
    or (student_id = auth.uid() and status = 'pending')
  );

drop policy if exists "enrollments_update" on enrollments;
create policy "enrollments_update" on enrollments
  for update to authenticated
  using (
    is_admin()
    or teaches_course(course_id)
    or (student_id = auth.uid() and status = 'rejected')
  )
  with check (
    is_admin()
    or teaches_course(course_id)
    or (student_id = auth.uid() and status = 'pending')
  );

drop policy if exists "enrollments_delete" on enrollments;
create policy "enrollments_delete" on enrollments
  for delete to authenticated
  using (
    is_admin()
    or teaches_course(course_id)
    or (student_id = auth.uid() and status = 'pending')
  );

-- class_sessions: readable by everyone signed in; writable by admins and by
-- the lecturer who teaches that course.
drop policy if exists "sessions_select_authenticated" on class_sessions;
create policy "sessions_select_authenticated" on class_sessions
  for select to authenticated using (true);

drop policy if exists "sessions_write_admin_or_lecturer" on class_sessions;
create policy "sessions_write_admin_or_lecturer" on class_sessions
  for all to authenticated
  using (is_admin() or teaches_course(course_id))
  with check (is_admin() or teaches_course(course_id));

-- attendance_records: admins and the course's lecturer can read/write all
-- rows for their course; a student can read only their own rows.
drop policy if exists "attendance_select_admin_lecturer" on attendance_records;
create policy "attendance_select_admin_lecturer" on attendance_records
  for select to authenticated
  using (
    is_admin()
    or student_id = auth.uid()
    or exists (
      select 1 from class_sessions cs
      where cs.id = session_id and teaches_course(cs.course_id)
    )
  );

drop policy if exists "attendance_write_admin_lecturer" on attendance_records;
create policy "attendance_write_admin_lecturer" on attendance_records
  for all to authenticated
  using (
    is_admin()
    or exists (
      select 1 from class_sessions cs
      where cs.id = session_id and teaches_course(cs.course_id)
    )
  )
  with check (
    is_admin()
    or exists (
      select 1 from class_sessions cs
      where cs.id = session_id and teaches_course(cs.course_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Reporting: students below the attendance threshold, used on the admin
-- overview page and the student's own exam-eligibility flag. Present and
-- late both count as "attended".
-- ---------------------------------------------------------------------------
create or replace function student_attendance_rates(threshold numeric default 75)
returns table (student_id uuid, full_name text, rate numeric)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id as student_id,
    p.full_name,
    round(
      100.0 * count(*) filter (where ar.status <> 'absent') / count(*),
      1
    ) as rate
  from profiles p
  join attendance_records ar on ar.student_id = p.id
  where p.role = 'student'
  group by p.id, p.full_name
  having 100.0 * count(*) filter (where ar.status <> 'absent') / count(*) < threshold
  order by rate asc;
$$;

-- Attendance rate per calendar date, across every course, used for the
-- admin "attendance trend" chart.
create or replace function attendance_trend()
returns table (session_date date, rate numeric, total bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    cs.session_date,
    round(100.0 * count(*) filter (where ar.status <> 'absent') / count(*), 1) as rate,
    count(*) as total
  from attendance_records ar
  join class_sessions cs on cs.id = ar.session_id
  group by cs.session_date
  order by cs.session_date asc;
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created — whether
-- they self-registered via /signup (full_name/role/student_id come from the
-- signup form as user metadata) or an admin created them from the admin
-- panel (same metadata shape, set server-side).
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, role, student_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student'),
    new.raw_user_meta_data ->> 'student_id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
