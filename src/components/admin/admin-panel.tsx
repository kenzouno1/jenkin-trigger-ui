"use client";

import { useState } from "react";
import { UserList } from "./user-list";
import { JobPermissions } from "./job-permissions";
import { TriggerHistoryTable } from "./trigger-history-table";
import { Users, Key, History } from "lucide-react";

const TABS = [
  { id: "users", label: "Users", icon: Users },
  { id: "permissions", label: "Job Permissions", icon: Key },
  { id: "history", label: "Trigger History", icon: History },
] as const;

type TabId = typeof TABS[number]["id"];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  return (
    <div>
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-800 mb-6">
        {TABS.map((tab) => (
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

      {activeTab === "users" && <UserList />}
      {activeTab === "permissions" && <JobPermissions />}
      {activeTab === "history" && <TriggerHistoryTable />}
    </div>
  );
}
