"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { JobList } from "@/components/job-list";
import { TriggerModal } from "@/components/trigger-modal";
import { BuildMonitorOverview } from "@/components/build-monitor-overview";
import { BuildHistoryPanel } from "@/components/build-history-panel";
import { DashboardStats } from "@/components/dashboard-stats";
import { FavoritesList } from "@/components/favorites-list";
import { RecentBuildsTable } from "@/components/recent-builds-table";
import { useJobs } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { AdminPanel } from "@/components/admin/admin-panel";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { colorToStatus } from "@/lib/jenkins-types";
import {
  Beaker,
  List,
  Monitor,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  const [triggerJob, setTriggerJob] = useState<string | null>(null);
  const [monitoredBuild, setMonitoredBuild] = useState<{
    name: string;
    number: number;
  } | null>(null);
  const [historyJob, setHistoryJob] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { data: jobs } = useJobs();
  const { user, logout } = useAuth();

  const total = jobs?.length ?? 0;
  const running = jobs?.filter((j) => j.color.endsWith("_anime")).length ?? 0;
  const failed = jobs?.filter((j) => colorToStatus(j.color) === "failed").length ?? 0;
  const success = jobs?.filter((j) => colorToStatus(j.color) === "success").length ?? 0;

  // Track polling timeouts for cleanup
  const pollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const handleTriggered = useCallback((name: string) => {
    setActiveTab("monitor");
    fetch(`/api/jenkins/jobs/${encodeURIComponent(name)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((detail) => {
        const targetNumber = detail.nextBuildNumber;
        const pollForBuild = (attempts: number) => {
          fetch(`/api/jenkins/builds/${encodeURIComponent(name)}/${targetNumber}`, {
            credentials: "include",
          })
            .then((r) => {
              if (r.ok) {
                setMonitoredBuild({ name, number: targetNumber });
              } else if (attempts > 0) {
                pollTimerRef.current = setTimeout(() => pollForBuild(attempts - 1), 3000);
              }
            })
            .catch(() => {
              if (attempts > 0) {
                pollTimerRef.current = setTimeout(() => pollForBuild(attempts - 1), 3000);
              }
            });
        };
        pollTimerRef.current = setTimeout(() => pollForBuild(10), 2000);
      })
      .catch(() => {});
  }, []);

  const handleViewBuild = useCallback((name: string) => {
    fetch(`/api/jenkins/jobs/${encodeURIComponent(name)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((detail) => {
        if (detail.lastBuild) {
          setMonitoredBuild({ name, number: detail.lastBuild.number });
          setActiveTab("monitor");
        }
      })
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Beaker },
    { id: "jobs", label: "Jobs", icon: List },
    { id: "monitor", label: "Build Monitor", icon: Monitor },
    ...(user?.role === "admin"
      ? [{ id: "admin", label: "Admin", icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="font-mono text-base font-bold tracking-tight">
              Jenkins<span className="text-blue-400">Trigger</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 font-mono">v1.0.0</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-zinc-400">Connected</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">{user.username}</span>
                {user.role === "admin" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out"
              className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              title="Đổi mật khẩu"
              className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Tab navigation */}
        <div className="flex items-center gap-1 border-b border-zinc-800 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-400 rounded-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Dashboard tab */}
        {activeTab === "dashboard" && (
          <div>
            <DashboardStats
              total={total}
              running={running}
              failed={failed}
              success={success}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-1">
                <FavoritesList onTrigger={setTriggerJob} onViewHistory={setHistoryJob} />
              </div>
              <div className="lg:col-span-2">
                <RecentBuildsTable onViewBuild={handleViewBuild} onViewHistory={setHistoryJob} />
              </div>
            </div>
          </div>
        )}

        {/* Jobs tab */}
        {activeTab === "jobs" && (
          <JobList onTrigger={setTriggerJob} onViewBuild={handleViewBuild} onViewHistory={setHistoryJob} />
        )}

        {/* Monitor tab */}
        {activeTab === "monitor" && (
          <BuildMonitorOverview
            selectedBuild={monitoredBuild}
            onSelectBuild={(name, number) => setMonitoredBuild({ name, number })}
            onClearBuild={() => setMonitoredBuild(null)}
          />
        )}

        {/* Admin tab — only render for admin users */}
        {activeTab === "admin" && user?.role === "admin" && <AdminPanel />}
      </div>

      {/* Build history dialog */}
      <BuildHistoryPanel
        jobName={historyJob}
        open={!!historyJob}
        onClose={() => setHistoryJob(null)}
        onSelectBuild={(name, number) => {
          setMonitoredBuild({ name, number });
          setActiveTab("monitor");
        }}
      />

      {/* Trigger modal */}
      <TriggerModal
        jobName={triggerJob}
        open={!!triggerJob}
        onClose={() => setTriggerJob(null)}
        onTriggered={handleTriggered}
      />

      {/* Change password dialog */}
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
}
