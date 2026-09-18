"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Course } from "@/lib/database.types";

export function SessionPicker({
  courses,
  courseId,
  date,
}: {
  courses: Course[];
  courseId?: string;
  date: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localDate, setLocalDate] = useState(date);

  function navigate(nextCourse: string | undefined, nextDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextCourse) params.set("course", nextCourse);
    params.set("date", nextDate);
    router.push(`/lecturer/attendance?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="grid gap-1.5">
        <Label>Course</Label>
        <Select value={courseId} onValueChange={(v) => navigate(v, localDate)}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Class date</Label>
        <Input
          type="date"
          value={localDate}
          className="w-full sm:w-44"
          onChange={(e) => {
            setLocalDate(e.target.value);
            navigate(courseId, e.target.value);
          }}
        />
      </div>
    </div>
  );
}
