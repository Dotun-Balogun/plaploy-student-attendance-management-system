import { createClient } from "@/lib/supabase/server";
import { StudentDialog } from "@/components/admin/student-dialog";
import { StudentsExportMenu } from "@/components/admin/students-export";
import { StudentsTable } from "@/components/admin/students-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("full_name");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium">Students</h2>
          <p className="text-sm text-muted-foreground">Manage student accounts and institution IDs.</p>
        </div>
        <StudentDialog />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All students</CardTitle>
            <CardDescription>{students?.length ?? 0} registered</CardDescription>
          </div>
          <StudentsExportMenu students={students ?? []} />
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <StudentsTable students={students ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
