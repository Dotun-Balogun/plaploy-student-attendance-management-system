"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { decideEnrollment, decideEnrollmentsBulk } from "@/lib/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { EnrollmentStatus } from "@/lib/database.types";

export interface EnrollmentRequestRow {
  id: string;
  status: EnrollmentStatus;
  requested_at: string;
  student_name: string;
  student_id: string | null;
  course_code: string;
  course_name: string;
}

export function EnrollmentQueue({ requests }: { requests: EnrollmentRequestRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const pendingRows = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const approvedRows = useMemo(() => requests.filter((r) => r.status === "approved"), [requests]);
  const rejectedRows = useMemo(() => requests.filter((r) => r.status === "rejected"), [requests]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === pendingRows.length ? new Set() : new Set(pendingRows.map((r) => r.id))));
  }

  function decideOne(id: string, decision: "approved" | "rejected") {
    startTransition(async () => {
      try {
        await decideEnrollment(id, decision);
        toast.success(decision === "approved" ? "Request approved" : "Request rejected");
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update the request");
      }
    });
  }

  function decideBulk(decision: "approved" | "rejected") {
    const ids = Array.from(selected);
    startTransition(async () => {
      try {
        await decideEnrollmentsBulk(ids, decision);
        toast.success(`${ids.length} request${ids.length === 1 ? "" : "s"} ${decision}`);
        setSelected(new Set());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update the requests");
      }
    });
  }

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">Pending ({pendingRows.length})</TabsTrigger>
        <TabsTrigger value="approved">Approved ({approvedRows.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedRows.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        {pendingRows.length > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={selected.size === pendingRows.length}
                onChange={toggleAll}
              />
              Select all
            </label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={selected.size === 0 || pending} onClick={() => decideBulk("rejected")}>
                <X className="h-4 w-4" /> Reject selected
              </Button>
              <Button size="sm" disabled={selected.size === 0 || pending} onClick={() => decideBulk("approved")}>
                <Check className="h-4 w-4" /> Approve selected
              </Button>
            </div>
          </div>
        )}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{r.student_name}</span>
                      <span className="text-xs text-muted-foreground">{r.student_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.course_code}</Badge>{" "}
                    <span className="text-muted-foreground">{r.course_name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => decideOne(r.id, "rejected")}>
                        Reject
                      </Button>
                      <Button size="sm" disabled={pending} onClick={() => decideOne(r.id, "approved")}>
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No pending requests right now.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="approved">
        <RequestListReadOnly rows={approvedRows} />
      </TabsContent>
      <TabsContent value="rejected">
        <RequestListReadOnly rows={rejectedRows} />
      </TabsContent>
    </Tabs>
  );
}

function RequestListReadOnly({ rows }: { rows: EnrollmentRequestRow[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{r.student_name}</span>
                  <span className="text-xs text-muted-foreground">{r.student_id}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{r.course_code}</Badge>{" "}
                <span className="text-muted-foreground">{r.course_name}</span>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                Nothing here yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
