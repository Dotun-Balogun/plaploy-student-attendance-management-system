"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { decideEnrollment } from "@/lib/actions/enrollments";
import { Button } from "@/components/ui/button";

export function EnrollmentDecisionButtons({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function decide(decision: "approved" | "rejected") {
    startTransition(async () => {
      try {
        await decideEnrollment(id, decision);
        toast.success(decision === "approved" ? "Approved" : "Rejected");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update the request");
      }
    });
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" disabled={pending} onClick={() => decide("rejected")}>
        <X className="h-4 w-4 text-destructive" />
      </Button>
      <Button variant="ghost" size="icon" disabled={pending} onClick={() => decide("approved")}>
        <Check className="h-4 w-4 text-present" />
      </Button>
    </div>
  );
}
