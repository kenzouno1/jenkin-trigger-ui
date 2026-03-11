"use client";

import { useQuery } from "@tanstack/react-query";
import type { JenkinsBuildInfo, ConsoleOutput } from "@/lib/jenkins-types";
import { useRef, useCallback, useEffect } from "react";

export function useBuildStatus(
  name: string | null,
  buildNumber: number | null
) {
  return useQuery<JenkinsBuildInfo>({
    queryKey: ["jenkins-build", name, buildNumber],
    queryFn: async () => {
      const res = await fetch(
        `/api/jenkins/builds/${encodeURIComponent(name!)}/${buildNumber}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch build status");
      return res.json();
    },
    enabled: !!name && !!buildNumber,
    refetchInterval: (query) => {
      return query.state.data?.building ? 5_000 : false;
    },
  });
}

export function useConsoleOutput(
  name: string | null,
  buildNumber: number | null,
  enabled = true
) {
  const offsetRef = useRef(0);
  const fullTextRef = useRef("");

  // Reset accumulated state when build changes
  useEffect(() => {
    offsetRef.current = 0;
    fullTextRef.current = "";
  }, [name, buildNumber]);

  const query = useQuery<ConsoleOutput>({
    queryKey: ["jenkins-console", name, buildNumber],
    queryFn: async () => {
      const res = await fetch(
        `/api/jenkins/builds/${encodeURIComponent(name!)}/${buildNumber}/console?start=${offsetRef.current}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch console");
      const data: ConsoleOutput = await res.json();
      fullTextRef.current += data.text;
      offsetRef.current = data.offset;
      return { ...data, text: fullTextRef.current };
    },
    enabled: !!name && !!buildNumber && enabled,
    refetchInterval: (query) => {
      return query.state.data?.hasMore ? 2_000 : false;
    },
  });

  const reset = useCallback(() => {
    offsetRef.current = 0;
    fullTextRef.current = "";
  }, []);

  return { ...query, reset };
}
