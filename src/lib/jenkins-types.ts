/** Jenkins API response types */

export interface JenkinsJob {
  name: string;
  url: string;
  color: string;
  fullName?: string;
  description?: string;
  lastBuild?: {
    number: number;
    timestamp: number;
    duration: number;
    result: string | null;
  } | null;
}

export interface JenkinsJobDetail {
  name: string;
  url: string;
  color: string;
  description: string;
  buildable: boolean;
  inQueue: boolean;
  lastBuild: JenkinsBuildRef | null;
  lastSuccessfulBuild: JenkinsBuildRef | null;
  lastFailedBuild: JenkinsBuildRef | null;
  nextBuildNumber: number;
  property: JenkinsJobProperty[];
}

export interface JenkinsBuildRef {
  number: number;
  url: string;
}

export interface JenkinsJobProperty {
  _class: string;
  parameterDefinitions?: JenkinsParamDefinition[];
}

export interface JenkinsParamDefinition {
  name: string;
  type: string;
  description: string;
  defaultParameterValue?: {
    name: string;
    value: string | boolean | number;
  };
  choices?: string[];
}

/** Normalized parameter for our UI */
export interface JobParameter {
  name: string;
  type: "string" | "choice" | "boolean" | "password" | "text" | "file";
  description: string;
  defaultValue: string | boolean;
  choices?: string[];
}

export interface JenkinsBuildInfo {
  number: number;
  url: string;
  result: "SUCCESS" | "FAILURE" | "UNSTABLE" | "ABORTED" | null;
  building: boolean;
  timestamp: number;
  duration: number;
  estimatedDuration: number;
  displayName: string;
  fullDisplayName: string;
}

export interface JenkinsQueueItem {
  id: number;
  task: { name: string; url: string; color: string };
  why: string;
  inQueueSince: number;
  stuck: boolean;
  blocked: boolean;
}

export interface JenkinsRunningBuild {
  jobName: string;
  number: number;
  url: string;
  result: string | null;
  building: boolean;
  timestamp: number;
  duration: number;
  estimatedDuration: number;
  displayName: string;
  fullDisplayName: string;
}

export interface ConsoleOutput {
  text: string;
  offset: number;
  hasMore: boolean;
}

/** Mapped job status from Jenkins color field */
export type JobStatus =
  | "success"
  | "failed"
  | "unstable"
  | "running"
  | "queued"
  | "disabled"
  | "notbuilt";

/** Map Jenkins color to our status */
export function colorToStatus(color: string): JobStatus {
  if (color.endsWith("_anime")) return "running";
  const base = color.replace("_anime", "");
  switch (base) {
    case "blue":
      return "success";
    case "red":
      return "failed";
    case "yellow":
      return "unstable";
    case "grey":
      return "queued";
    case "aborted":
      return "failed";
    case "disabled":
    case "notbuilt":
      return "disabled";
    default:
      return "notbuilt";
  }
}

/** Map Jenkins build result to our status */
export function resultToStatus(
  result: string | null,
  building: boolean
): JobStatus {
  if (building) return "running";
  switch (result) {
    case "SUCCESS":
      return "success";
    case "FAILURE":
      return "failed";
    case "UNSTABLE":
      return "unstable";
    case "ABORTED":
      return "failed";
    default:
      return "queued";
  }
}

/** Dot color classes by job status */
export const dotColors: Record<JobStatus, string> = {
  success: "bg-green-500",
  failed: "bg-red-500",
  unstable: "bg-orange-500",
  running: "bg-blue-500 animate-pulse",
  queued: "bg-zinc-500",
  disabled: "bg-zinc-700",
  notbuilt: "bg-zinc-700",
};
