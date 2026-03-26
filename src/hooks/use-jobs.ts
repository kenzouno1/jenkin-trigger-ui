"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JenkinsJob, JenkinsJobDetail, JenkinsBuildInfo, JobParameter, JenkinsQueueItem, JenkinsRunningBuild } from "@/lib/jenkins-types";

type JobDetailWithParams = JenkinsJobDetail & {
  parameters: JobParameter[];
  isGwt?: boolean;
};

export function useJobs() {
  return useQuery<JenkinsJob[]>({
    queryKey: ["jenkins-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jenkins/jobs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      return data.jobs ?? data;
    },
    refetchInterval: 30_000,
  });
}

export interface JenkinsView {
  name: string;
  jobs: string[];
}

export function useJenkinsViews() {
  return useQuery<JenkinsView[]>({
    queryKey: ["jenkins-views"],
    queryFn: async () => {
      const res = await fetch("/api/jenkins/views", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch views");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useJobDetail(name: string | null) {
  return useQuery<JobDetailWithParams>({
    queryKey: ["jenkins-job", name],
    queryFn: async () => {
      const res = await fetch(`/api/jenkins/jobs/${encodeURIComponent(name!)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch job detail");
      return res.json();
    },
    enabled: !!name,
  });
}

export function useBuildsHistory(jobName: string | null) {
  return useQuery<JenkinsBuildInfo[]>({
    queryKey: ["jenkins-builds", jobName],
    queryFn: async () => {
      const res = await fetch(`/api/jenkins/jobs/${encodeURIComponent(jobName!)}/builds`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch build history");
      return res.json();
    },
    enabled: !!jobName,
  });
}

export function useQueue() {
  return useQuery<JenkinsQueueItem[]>({
    queryKey: ["jenkins-queue"],
    queryFn: async () => {
      const res = await fetch("/api/jenkins/queue", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch queue");
      return res.json();
    },
    refetchInterval: 10_000,
  });
}

export function useRunningBuilds() {
  return useQuery<JenkinsRunningBuild[]>({
    queryKey: ["jenkins-running"],
    queryFn: async () => {
      const res = await fetch("/api/jenkins/running", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch running builds");
      return res.json();
    },
    refetchInterval: 10_000,
  });
}

export function useTriggerBuild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      parameters,
    }: {
      name: string;
      parameters?: Record<string, string>;
    }) => {
      const res = await fetch(
        `/api/jenkins/jobs/${encodeURIComponent(name)}/trigger`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parameters }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Trigger failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jenkins-jobs"] });
      qc.invalidateQueries({ queryKey: ["jenkins-queue"] });
      qc.invalidateQueries({ queryKey: ["jenkins-running"] });
    },
  });
}
