"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { requestEnrollment, withdrawEnrollment } from "@/lib/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { EnrollmentStatus } from "@/lib/database.types";

interface CourseRow {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturer_name: string | null;
}

export function CourseRegistrationCard({
  course,
  enrollmentId,
  status,
}: {
  course: CourseRow;
  enrollmentId: string | null;
  status: EnrollmentStatus | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleRequest() {
    startTransition(async () => {
      try {
        await requestEnrollment(course.id);
        toast.success("Request sent — your lecturer will review it");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not send the request");
      }
    });
  }

  function handleWithdraw() {
    if (!enrollmentId) return;
    startTransition(async () => {
      try {
        await withdrawEnrollment(enrollmentId);
        toast.success("Request withdrawn");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not withdraw the request");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="w-fit">
            {course.code}
          </Badge>
          {status === "approved" && (
            <Badge variant="present">
              <CheckCircle2 className="h-3 w-3" /> Enrolled
            </Badge>
          )}
          {status === "pending" && (
            <Badge variant="late">
              <Clock className="h-3 w-3" /> Pending
            </Badge>
          )}
          {status === "rejected" && (
            <Badge variant="absent">
              <XCircle className="h-3 w-3" /> Rejected
            </Badge>
          )}
        </div>
        <CardTitle className="mt-1 text-base">{course.name}</CardTitle>
        <CardDescription>
          {course.semester}
          {course.lecturer_name ? ` · ${course.lecturer_name}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === null && (
          <Button size="sm" onClick={handleRequest} disabled={pending}>
            {pending ? "Sending…" : "Request enrollment"}
          </Button>
        )}
        {status === "pending" && (
          <Button size="sm" variant="outline" onClick={handleWithdraw} disabled={pending}>
            {pending ? "Withdrawing…" : "Withdraw request"}
          </Button>
        )}
        {status === "rejected" && (
          <Button size="sm" variant="outline" onClick={handleRequest} disabled={pending}>
            {pending ? "Sending…" : "Request again"}
          </Button>
        )}
        {status === "approved" && (
          <p className="text-xs text-muted-foreground">You’re on the class list for this course.</p>
        )}
      </CardContent>
    </Card>
  );
}
