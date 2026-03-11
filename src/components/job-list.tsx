"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "./job-card";
import { useJobs } from "@/hooks/use-jobs";
import { colorToStatus } from "@/lib/jenkins-types";
import type { JobStatus } from "@/lib/jenkins-types";
import { Search, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobListProps {
  onTrigger: (name: string) => void;
  onViewBuild?: (name: string) => void;
  onViewHistory?: (name: string) => void;
}

const statusFilters: JobStatus[] = [
  "success",
  "failed",
  "running",
  "unstable",
  "queued",
  "disabled",
];

export function JobList({ onTrigger, onViewBuild, onViewHistory }: JobListProps) {
  const { data: jobs, isLoading, error, refetch } = useJobs();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<JobStatus | null>(null);

  const filtered = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((j) => {
      const matchesSearch = j.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        !activeFilter || colorToStatus(j.color) === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, activeFilter]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm">Failed to load Jenkins jobs</p>
        <p className="text-xs">{(error as Error).message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={activeFilter === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveFilter(null)}
        >
          All {jobs?.length ? `(${jobs.length})` : ""}
        </Badge>
        {statusFilters.map((s) => {
          const count = jobs?.filter((j) => colorToStatus(j.color) === s).length || 0;
          if (count === 0) return null;
          return (
            <Badge
              key={s}
              variant={activeFilter === s ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setActiveFilter(activeFilter === s ? null : s)
              }
            >
              {s} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Job list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((job) => (
            <JobCard
              key={job.name}
              job={job}
              onTrigger={onTrigger}
              onViewBuild={onViewBuild}
              onViewHistory={onViewHistory}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-8">
              No jobs found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
