"use client";

import { useState, useEffect } from "react";
import { useBuildStatus } from "@/hooks/use-build-status";
import { resultToStatus } from "@/lib/jenkins-types";
import { ConsoleOutput } from "./console-output";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Clock, Hash, ChevronDown } from "lucide-react";

interface BuildMonitorProps {
  jobName: string;
  buildNumber: number;
  onClose: () => void;
}

interface BuildRef {
  number: number;
  url: string;
}

export function BuildMonitor({ jobName, buildNumber, onClose }: BuildMonitorProps) {
  const [activeBuild, setActiveBuild] = useState(buildNumber);
  const [builds, setBuilds] = useState<BuildRef[]>([]);
  const [showList, setShowList] = useState(false);
  const { data: buildInfo } = useBuildStatus(jobName, activeBuild);

  // Fetch recent builds list
  useEffect(() => {
    fetch(`/api/jenkins/jobs/${encodeURIComponent(jobName)}/builds`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBuilds(data); })
      .catch(() => {});
  }, [jobName]);

  // Update when parent changes buildNumber
  useEffect(() => { setActiveBuild(buildNumber); }, [buildNumber]);

  const progress = buildInfo?.building
    ? Math.min(99, Math.round(((Date.now() - buildInfo.timestamp) / buildInfo.estimatedDuration) * 100))
    : buildInfo?.result ? 100 : 0;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="h-4 w-4" />
            {jobName}
            {/* Build number selector */}
            <div className="relative">
              <button
                onClick={() => setShowList(!showList)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-sm font-mono hover:bg-zinc-700 transition"
              >
                #{activeBuild}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showList && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {builds.map((b) => (
                    <button
                      key={b.number}
                      onClick={() => { setActiveBuild(b.number); setShowList(false); }}
                      className={`w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-700 transition ${
                        b.number === activeBuild ? "text-blue-400" : "text-zinc-300"
                      }`}
                    >
                      #{b.number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            {buildInfo && (
              <StatusBadge status={resultToStatus(buildInfo.result, buildInfo.building)} />
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {buildInfo?.building && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {buildInfo && !buildInfo.building && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            Duration: {Math.round(buildInfo.duration / 1000)}s
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ConsoleOutput jobName={jobName} buildNumber={activeBuild} />
      </CardContent>
    </Card>
  );
}
