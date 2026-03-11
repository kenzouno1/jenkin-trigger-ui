"use client";

import { useBuildsHistory } from "@/hooks/use-jobs";
import { StatusBadge } from "./status-badge";
import { formatDuration, timeAgo } from "@/lib/format-utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { History } from "lucide-react";

interface BuildHistoryPanelProps {
  jobName: string | null;
  open: boolean;
  onClose: () => void;
  onSelectBuild: (name: string, number: number) => void;
}

type BuildStatus = "running" | "success" | "failed" | "unstable" | "queued";

function resultToStatus(result: string | null, building: boolean): BuildStatus {
  if (building) return "running";
  switch (result) {
    case "SUCCESS": return "success";
    case "FAILURE":
    case "ABORTED": return "failed";
    case "UNSTABLE": return "unstable";
    default: return "queued";
  }
}

export function BuildHistoryPanel({
  jobName,
  open,
  onClose,
  onSelectBuild,
}: BuildHistoryPanelProps) {
  const { data: builds, isLoading, error } = useBuildsHistory(open ? jobName : null);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-4xl w-[90vw] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-base">
            <History className="h-4 w-4" />
            {jobName} — Build History
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">Build</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium">Duration</th>
                <th className="text-right px-4 py-2.5 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-10 ml-auto" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-14 ml-auto" /></td>
                  </tr>
                ))}
              {error && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-red-400 text-sm">
                    Failed to load build history
                  </td>
                </tr>
              )}
              {builds?.map((build) => (
                <tr
                  key={build.number}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition cursor-pointer"
                  onClick={() => {
                    if (jobName) {
                      onSelectBuild(jobName, build.number);
                      onClose();
                    }
                  }}
                >
                  <td className="px-4 py-2.5 font-mono font-medium">
                    #{build.number}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={resultToStatus(build.result, build.building)} />
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">
                    {build.result ? formatDuration(build.duration) : "..."}
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">
                    {timeAgo(build.timestamp)}
                  </td>
                </tr>
              ))}
              {!isLoading && builds?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No builds found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
