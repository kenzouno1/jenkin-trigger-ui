"use client";

import { useState, useMemo } from "react";
import { useJobs, useQueue, useRunningBuilds, useBuildsHistory } from "@/hooks/use-jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsoleOutput } from "./console-output";
import { StatusBadge } from "./status-badge";
import { formatDuration, timeAgo } from "@/lib/format-utils";
import { resultToStatus, colorToStatus } from "@/lib/jenkins-types";
import type { JenkinsBuildInfo } from "@/lib/jenkins-types";
import { useBuildStatus } from "@/hooks/use-build-status";
import { Clock, Inbox, Hash, AlertTriangle, Monitor, Loader2, ChevronDown } from "lucide-react";

interface BuildMonitorOverviewProps {
  selectedBuild: { name: string; number: number } | null;
  onSelectBuild: (name: string, number: number) => void;
  onClearBuild: () => void;
}

export function BuildMonitorOverview({ selectedBuild, onSelectBuild, onClearBuild }: BuildMonitorOverviewProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);

  const { data: jobs } = useJobs();
  const { data: queue, isLoading: queueLoading } = useQueue();
  const { data: running, isLoading: runningLoading } = useRunningBuilds();
  const { data: builds, isLoading: buildsLoading } = useBuildsHistory(selectedJob);
  const { data: buildInfo } = useBuildStatus(
    selectedBuild?.name ?? null,
    selectedBuild?.number ?? null,
  );

  // Job names for filter dropdown
  const jobNames = useMemo(() => {
    if (!jobs) return [];
    return jobs.map((j) => j.name).sort();
  }, [jobs]);

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)]">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col overflow-hidden border-r border-zinc-800 pr-3">
        {/* Job filter */}
        <div className="relative mb-3">
          <button
            onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition text-xs"
          >
            <span className={selectedJob ? "text-zinc-200" : "text-zinc-500"}>
              {selectedJob ?? "All Jobs"}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>
          {jobDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              <button
                onClick={() => { setSelectedJob(null); setJobDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition ${
                  !selectedJob ? "text-blue-400" : "text-zinc-300"
                }`}
              >
                All Jobs
              </button>
              {jobNames.map((name) => (
                <button
                  key={name}
                  onClick={() => { setSelectedJob(name); setJobDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition truncate ${
                    selectedJob === name ? "text-blue-400" : "text-zinc-300"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Build list */}
        <div className="flex items-center gap-1.5 px-1 mb-2">
          <Inbox className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {selectedJob ? "Build History" : "Build Queue"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {selectedJob ? (
            /* Job selected — show build history */
            buildsLoading ? (
              <SkeletonItems count={5} />
            ) : builds?.length ? (
              builds.map((build) => (
                <BuildItem
                  key={build.number}
                  jobName={selectedJob}
                  build={build}
                  isActive={selectedBuild?.name === selectedJob && selectedBuild?.number === build.number}
                  onSelect={() => onSelectBuild(selectedJob, build.number)}
                />
              ))
            ) : (
              <EmptyText>No builds found</EmptyText>
            )
          ) : (
            /* No job selected — show running + queued */
            (queueLoading || runningLoading) ? (
              <SkeletonItems count={3} />
            ) : (
              <>
                {running?.map((build) => {
                  const progress = build.estimatedDuration > 0
                    ? Math.min(99, Math.round(((Date.now() - build.timestamp) / build.estimatedDuration) * 100))
                    : 0;
                  const isActive = selectedBuild?.name === build.jobName && selectedBuild?.number === build.number;
                  return (
                    <button
                      key={`run-${build.jobName}-${build.number}`}
                      onClick={() => onSelectBuild(build.jobName, build.number)}
                      className={`w-full text-left px-3 py-2.5 rounded-md border transition ${
                        isActive
                          ? "bg-zinc-800 border-blue-500/40 ring-1 ring-blue-500/20"
                          : "bg-zinc-800/30 border-zinc-800 hover:bg-zinc-800/70 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-200 truncate max-w-[130px]">
                          {build.jobName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
                          <Hash className="h-2.5 w-2.5" />{build.number}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-amber-400" />
                          {formatDuration(Date.now() - build.timestamp)}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400">{progress}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}

                {queue?.map((item) => (
                  <div
                    key={`q-${item.id}`}
                    className="px-3 py-2.5 rounded-md bg-zinc-800/30 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400 truncate max-w-[130px]">
                        {item.task?.name ?? "Unknown"}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.stuck && <AlertTriangle className="h-3 w-3 text-red-400" />}
                        <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{timeAgo(item.inQueueSince)}
                        </span>
                      </div>
                    </div>
                    {item.why && (
                      <p className="text-[10px] text-zinc-600 mt-1 truncate">{item.why}</p>
                    )}
                  </div>
                ))}

                {!running?.length && !queue?.length && (
                  <EmptyText>No builds in queue</EmptyText>
                )}
              </>
            )
          )}
        </div>
      </div>

      {/* Main area — console output */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedBuild ? (
          <>
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">{selectedBuild.name}</span>
                <span className="text-xs font-mono text-zinc-500">#{selectedBuild.number}</span>
                {buildInfo && (
                  <StatusBadge status={resultToStatus(buildInfo.result, buildInfo.building)} />
                )}
              </div>
              {buildInfo && !buildInfo.building && (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(buildInfo.duration)}
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <ConsoleOutput jobName={selectedBuild.name} buildNumber={selectedBuild.number} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Monitor className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">Select a build to view console output</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Single build item in the history list */
function BuildItem({ jobName, build, isActive, onSelect }: {
  jobName: string;
  build: JenkinsBuildInfo;
  isActive: boolean;
  onSelect: () => void;
}) {
  const status = resultToStatus(build.result, build.building);
  const isRunning = build.building;
  const progress = isRunning && build.estimatedDuration > 0
    ? Math.min(99, Math.round(((Date.now() - build.timestamp) / build.estimatedDuration) * 100))
    : null;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-md border transition ${
        isActive
          ? "bg-zinc-800 border-blue-500/40 ring-1 ring-blue-500/20"
          : "bg-zinc-800/30 border-zinc-800 hover:bg-zinc-800/70 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
          <Hash className="h-2.5 w-2.5" />{build.number}
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-zinc-500">{timeAgo(build.timestamp)}</span>
        {isRunning && progress !== null ? (
          <span className="text-[10px] font-mono text-amber-400">{progress}%</span>
        ) : build.duration ? (
          <span className="text-[10px] text-zinc-600">{formatDuration(build.duration)}</span>
        ) : null}
      </div>
      {isRunning && progress !== null && (
        <div className="h-1 rounded-full bg-zinc-700 overflow-hidden mt-1">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  );
}

function SkeletonItems({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-zinc-600 px-3 py-4 text-center">{children}</p>;
}
