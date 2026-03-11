"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTriggerHistory } from "@/hooks/use-admin";
import { AlertCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function ParamsCell({ params }: { params: Record<string, string> | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!params || Object.keys(params).length === 0) {
    return <span className="text-zinc-600 text-xs">—</span>;
  }
  return (
    <div>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {Object.keys(params).length} param{Object.keys(params).length !== 1 ? "s" : ""}
      </button>
      {expanded && (
        <pre className="mt-1 text-xs bg-zinc-800 text-zinc-300 rounded p-2 max-w-xs overflow-x-auto">
          {JSON.stringify(params, null, 2)}
        </pre>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  success: "text-green-400",
  failed: "text-red-400",
  running: "text-blue-400",
  aborted: "text-zinc-500",
};

export function TriggerHistoryTable() {
  const [page, setPage] = useState(1);
  const [jobFilter, setJobFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const LIMIT = 20;

  const { data, isLoading, error } = useTriggerHistory({
    page,
    limit: LIMIT,
    job_name: debouncedFilter || undefined,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce filter changes properly with cleanup
  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedFilter(jobFilter), 400);
    return () => clearTimeout(debounceRef.current);
  }, [jobFilter]);

  const handleFilterChange = (v: string) => {
    setJobFilter(v);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-zinc-200">Trigger History</CardTitle>
        <Input
          placeholder="Filter by job name..."
          value={jobFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="h-7 w-52 text-xs bg-zinc-800 border-zinc-700"
        />
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="space-y-2 px-6 pb-4 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md bg-zinc-800" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-6 py-4 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            Failed to load history
          </div>
        )}

        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="px-6 py-2.5 text-left font-medium">Time</th>
                    <th className="px-4 py-2.5 text-left font-medium">User</th>
                    <th className="px-4 py-2.5 text-left font-medium">Job</th>
                    <th className="px-4 py-2.5 text-left font-medium">Parameters</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-3 text-xs text-zinc-400 whitespace-nowrap">
                        {formatTs(item.triggered_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{item.username}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{item.job_name}</td>
                      <td className="px-4 py-3">
                        <ParamsCell params={item.parameters} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium capitalize ${STATUS_COLORS[item.status] ?? "text-zinc-400"}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                        No history entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">
                  Page {page} of {totalPages} &mdash; {data.total} total
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-zinc-400"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-zinc-400"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
