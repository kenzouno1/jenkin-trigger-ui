"use client";

import { Button } from "@/components/ui/button";
import { colorToStatus, dotColors } from "@/lib/jenkins-types";
import type { JenkinsJob } from "@/lib/jenkins-types";
import { Play, ExternalLink, History } from "lucide-react";

interface JobCardProps {
  job: JenkinsJob;
  onTrigger: (name: string) => void;
  onViewBuild?: (name: string) => void;
  onViewHistory?: (name: string) => void;
}

export function JobCard({ job, onTrigger, onViewBuild, onViewHistory }: JobCardProps) {
  const status = colorToStatus(job.color);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between hover:bg-zinc-800/50 transition cursor-pointer group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColors[status]}`} />
        <div className="min-w-0">
          <button
            className="text-sm font-medium truncate hover:text-blue-400 transition-colors text-left block"
            onClick={() => onViewBuild?.(job.name)}
            title={job.name}
          >
            {job.name}
          </button>
          {job.description && (
            <p className="text-xs text-zinc-500 truncate max-w-[400px]">
              {job.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewHistory?.(job.name)}
          className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition border-zinc-700 hover:bg-zinc-800"
        >
          <History className="h-3 w-3" />
          History
        </Button>
        <Button
          size="sm"
          onClick={() => onTrigger(job.name)}
          className="gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs opacity-0 group-hover:opacity-100 transition"
        >
          <Play className="h-3 w-3" />
          Trigger
        </Button>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition opacity-0 group-hover:opacity-100"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
