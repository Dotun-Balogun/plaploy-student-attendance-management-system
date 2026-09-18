import { createClient } from "@/lib/supabase/server";
import { deleteLecturer } from "@/lib/actions/lecturers";
import { LecturerDialog } from "@/components/admin/lecturer-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { LecturersExportMenu } from "@/components/admin/lecturers-export";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export default async function AdminLecturersPage() {
  const supabase = await createClient();
  const { data: lecturers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "lecturer")
    .order("full_name");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium">Lecturers</h2>
          <p className="text-sm text-muted-foreground">Manage lecturer accounts.</p>
        </div>
        <LecturerDialog />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All lecturers</CardTitle>
            <CardDescription>{lecturers?.length ?? 0} registered</CardDescription>
          </div>
          <LecturersExportMenu lecturers={lecturers ?? []} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lecturer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers?.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-xs">{initials(l.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{l.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.email}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <LecturerDialog lecturer={l} />
                      <DeleteButton
                        description={`This permanently removes ${l.full_name}'s account. Their courses will be unassigned.`}
                        action={deleteLecturer.bind(null, l.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!lecturers || lecturers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                    No lecturers yet. Add your first lecturer to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
