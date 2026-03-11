"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  full_name?: string;
}

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error("Failed to fetch auth state");
  return res.json();
}

export function useAuth() {
  const qc = useQueryClient();
  const router = useRouter();

  const query = useQuery<AuthUser | null>({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore network errors on logout
    } finally {
      qc.invalidateQueries({ queryKey: ["auth-me"] });
      router.push("/login");
    }
  };

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    logout,
    refetch: query.refetch,
  };
}
