"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUsers,
  useAllJenkinsJobs,
  useUserPermissions,
  useUpdatePermissions,
  type JobPermission,
} from "@/hooks/use-admin";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Save, Search } from "lucide-react";

export function JobPermissions() {
  const { data: users } = useUsers();
  const { data: allJobs, isLoading: jobsLoading } = useAllJenkinsJobs();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: existingPerms, isLoading: permsLoading } = useUserPermissions(selectedUserId);
  const updatePerms = useUpdatePermissions();
  const [matrix, setMatrix] = useState<Record<string, { can_view: boolean; can_trigger: boolean }>>({});
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  const filteredJobs = allJobs?.filter((job) =>
    job.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!allJobs) return;
    const base: Record<string, { can_view: boolean; can_trigger: boolean }> = {};
    allJobs.forEach((job) => {
      base[job] = { can_view: false, can_trigger: false };
    });
    if (existingPerms) {
      existingPerms.forEach((p) => {
        base[p.job_name] = { can_view: p.can_view, can_trigger: p.can_trigger };
      });
    }
    setMatrix(base);
    setSaved(false);
  }, [allJobs, existingPerms]);

  const toggle = (job: string, field: "can_view" | "can_trigger") => {
    setMatrix((prev) => ({
      ...prev,
      [job]: { ...prev[job], [field]: !prev[job][field] },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (selectedUserId === null) return;
    const permissions: JobPermission[] = Object.entries(matrix).map(([job_name, v]) => ({
      job_name,
      can_view: v.can_view,
      can_trigger: v.can_trigger,
    }));
    await updatePerms.mutateAsync({ userId: selectedUserId, permissions });
    setSaved(true);
  };

  const isLoading = jobsLoading || permsLoading;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-zinc-200">Job Permissions</CardTitle>
        {selectedUserId !== null && (
          <Button size="sm" onClick={handleSave} disabled={updatePerms.isPending} className="gap-1.5">
            {updatePerms.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Permissions
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 shrink-0">Select user:</span>
          <Select
            value={selectedUserId ?? ""}
            onValueChange={(v) => setSelectedUserId(v)}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Choose a user..." />
            </SelectTrigger>
            <SelectContent>
              {users?.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserId !== null && isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md bg-zinc-800" />
            ))}
          </div>
        )}

        {updatePerms.isError && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {updatePerms.error?.message || "Failed to save permissions"}
          </div>
        )}

        {saved && !updatePerms.isError && (
          <p className="text-xs text-green-400">Permissions saved successfully.</p>
        )}

        {selectedUserId !== null && !isLoading && allJobs && (
          <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 bg-zinc-800 border-zinc-700 text-sm"
            />
          </div>
          <div className="overflow-x-auto rounded-md border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="px-4 py-2.5 text-left font-medium">Job Name</th>
                  <th className="px-4 py-2.5 text-center font-medium">Can View</th>
                  <th className="px-4 py-2.5 text-center font-medium">Can Trigger</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs?.map((job) => (
                  <tr key={job} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{job}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        className="accent-blue-400 w-4 h-4 cursor-pointer"
                        checked={matrix[job]?.can_view ?? false}
                        onChange={() => toggle(job, "can_view")}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        className="accent-blue-400 w-4 h-4 cursor-pointer"
                        checked={matrix[job]?.can_trigger ?? false}
                        onChange={() => toggle(job, "can_trigger")}
                      />
                    </td>
                  </tr>
                ))}
                {filteredJobs?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-sm">
                      {search ? "No jobs matching search." : "No Jenkins jobs found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {selectedUserId === null && (
          <p className="text-sm text-zinc-500 py-4">Select a user to manage their job permissions.</p>
        )}
      </CardContent>
    </Card>
  );
}
