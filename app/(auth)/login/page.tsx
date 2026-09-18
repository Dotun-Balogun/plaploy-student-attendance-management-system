import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import Link from 'next/link';
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/60 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-sm ring-1 ring-border">
            <Image src="/psp-logo.jpg" alt="Plateau State Polytechnic crest" width={56} height={56} className="h-full w-full object-contain" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium">Plateau State Polytechnic</h1>
            <p className="text-sm text-muted-foreground">Student Attendance Management System</p>
          </div>
        </div>
        <LoginForm justRegistered={registered === "1"} />
      </div>
    </div>
  );
}
