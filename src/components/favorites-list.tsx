"use client";

import { useState, useEffect, useCallback } from "react";
import { useJobs } from "@/hooks/use-jobs";
import { colorToStatus, dotColors } from "@/lib/jenkins-types";
import { History } from "lucide-react";

interface FavoritesListProps {
  onTrigger: (name: string) => void;
  onViewHistory?: (name: string) => void;
}

export function FavoritesList({ onTrigger, onViewHistory }: FavoritesListProps) {
  const { data: jobs } = useJobs();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jenkins-favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // Ignore corrupted localStorage data
    }
  }, []);

  const saveFavorites = useCallback((favs: string[]) => {
    setFavorites(favs);
    localStorage.setItem("jenkins-favorites", JSON.stringify(favs));
  }, []);

  const toggleFavorite = (name: string) => {
    const next = favorites.includes(name)
      ? favorites.filter((f) => f !== name)
      : [...favorites, name];
    saveFavorites(next);
  };

  const favJobs = jobs?.filter((j) => favorites.includes(j.name)) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Favorites
        </h2>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {editing && (
        <div className="space-y-1 mb-3 max-h-[200px] overflow-y-auto">
          {jobs?.map((j) => (
            <label
              key={j.name}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-800/50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={favorites.includes(j.name)}
                onChange={() => toggleFavorite(j.name)}
                className="rounded border-zinc-600"
              />
              {j.name}
            </label>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {favJobs.length === 0 && !editing && (
          <p className="text-xs text-zinc-500 py-4 text-center">
            No favorites yet. Click &quot;Edit&quot; to add.
          </p>
        )}
        {favJobs.map((job) => {
          const status = colorToStatus(job.color);
          return (
            <div
              key={job.name}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between hover:bg-zinc-800/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
                <div>
                  <div className="text-sm font-medium">{job.name}</div>
                  <div className="text-xs text-zinc-500">
                    {status === "running" ? "Running..." : status}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => onViewHistory?.(job.name)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
                  title="Build history"
                >
                  <History className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onTrigger(job.name)}
                  disabled={status === "running"}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    status === "running"
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {status === "running" ? "Running" : "Trigger"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
