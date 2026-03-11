"use client";

import { useJobs } from "@/hooks/use-jobs";
import { formatDuration, timeAgo } from "@/lib/format-utils";
import { History } from "lucide-react";

interface RecentBuildsTableProps {
  onViewBuild?: (name: string) => void;
  onViewHistory?: (name: string) => void;
}

const resultStyle: Record<string, { text: string; dot: string; label: string }> = {
  SUCCESS: { text: "text-green-400", dot: "bg-green-500", label: "SUCCESS" },
  FAILURE: { text: "text-red-400", dot: "bg-red-500", label: "FAILED" },
  UNSTABLE: { text: "text-orange-400", dot: "bg-orange-500", label: "UNSTABLE" },
  ABORTED: { text: "text-zinc-400", dot: "bg-zinc-500", label: "ABORTED" },
  null: { text: "text-blue-400", dot: "bg-blue-500 animate-pulse", label: "RUNNING" },
};

export function RecentBuildsTable({ onViewBuild, onViewHistory }: RecentBuildsTableProps) {
  const { data: jobs } = useJobs();

  // Sort by last build timestamp (most recent first), only jobs with builds
  const withBuilds = (jobs || [])
    .filter((j) => j.lastBuild?.timestamp)
    .sort((a, b) => (b.lastBuild!.timestamp - a.lastBuild!.timestamp))
    .slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Recent Builds
        </h2>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-medium">Job</th>
              <th className="text-left px-4 py-2.5 font-medium">Build</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-right px-4 py-2.5 font-medium">Duration</th>
              <th className="text-right px-4 py-2.5 font-medium">When</th>
              <th className="px-4 py-2.5 font-medium w-8"></th>
            </tr>
          </thead>
          <tbody>
            {withBuilds.map((job) => {
              const b = job.lastBuild!;
              const r = resultStyle[String(b.result)] || resultStyle["null"];
              return (
                <tr
                  key={job.name}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition cursor-pointer"
                  onClick={() => onViewBuild?.(job.name)}
                >
                  <td className="px-4 py-2.5 font-medium">{job.name}</td>
                  <td className="px-4 py-2.5 text-zinc-400 font-mono">#{b.number}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
                      <span className={`text-xs font-medium ${r.text}`}>{r.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">
                    {b.result ? formatDuration(b.duration) : "..."}
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">
                    {timeAgo(b.timestamp)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewHistory?.(job.name); }}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
                      title="View build history"
                    >
                      <History className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {withBuilds.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  No recent builds
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
