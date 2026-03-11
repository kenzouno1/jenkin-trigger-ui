"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConsoleOutput } from "@/hooks/use-build-status";
import { Loader2, Terminal } from "lucide-react";

interface ConsoleOutputProps {
  jobName: string;
  buildNumber: number;
}

export function ConsoleOutput({ jobName, buildNumber }: ConsoleOutputProps) {
  const { data, isLoading } = useConsoleOutput(jobName, buildNumber);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.text]);

  return (
    <div className="rounded-md border bg-zinc-950">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Console Output</span>
        {data?.hasMore && (
          <Loader2 className="h-3 w-3 animate-spin text-amber-400 ml-auto" />
        )}
      </div>
      <ScrollArea className="h-[400px]">
        <pre className="p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">
          {isLoading ? (
            <span className="text-muted-foreground">Loading console...</span>
          ) : (
            data?.text || "No output yet."
          )}
          <div ref={bottomRef} />
        </pre>
      </ScrollArea>
    </div>
  );
}
