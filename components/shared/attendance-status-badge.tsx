import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/lib/database.types";

const CONFIG: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle2 }> = {
  present: { label: "Present", icon: CheckCircle2 },
  late: { label: "Late", icon: Clock },
  absent: { label: "Absent", icon: XCircle },
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={status}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
