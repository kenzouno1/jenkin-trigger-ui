"use client";

import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/lib/jenkins-types";

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  success: { label: "Success", className: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" },
  failed: { label: "Failed", className: "bg-red-600/20 text-red-400 border-red-600/30" },
  unstable: { label: "Unstable", className: "bg-orange-600/20 text-orange-400 border-orange-600/30" },
  running: { label: "Running", className: "bg-amber-600/20 text-amber-400 border-amber-600/30 animate-pulse" },
  queued: { label: "Queued", className: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" },
  disabled: { label: "Disabled", className: "bg-zinc-700/20 text-zinc-500 border-zinc-700/30" },
  notbuilt: { label: "Not Built", className: "bg-zinc-700/20 text-zinc-500 border-zinc-700/30" },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
