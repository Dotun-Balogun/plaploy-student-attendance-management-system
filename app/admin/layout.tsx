import { requireProfile } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["admin"]);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title="Admin" name={profile.full_name} email={profile.email} />
        <main className="flex-1 bg-muted/40 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
