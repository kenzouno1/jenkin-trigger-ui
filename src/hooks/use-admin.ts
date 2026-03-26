"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  is_active: boolean;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  role?: "user" | "admin";
  is_active?: boolean;
}

export interface JobPermission {
  job_name: string;
  can_view: boolean;
  can_trigger: boolean;
}

export interface TriggerHistoryItem {
  id: string;
  triggered_at: string;
  username: string;
  job_name: string;
  parameters: Record<string, string> | null;
  status: string;
}

export interface TriggerHistoryParams {
  page?: number;
  limit?: number;
  job_name?: string;
}

export interface TriggerHistoryResponse {
  items: TriggerHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch("/api/users"),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiFetch<AdminUser>("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      apiFetch<AdminUser>(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, new_password }: { id: string; new_password: string }) =>
      apiFetch(`/api/users/${id}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password }),
      }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useUserPermissions(userId: string | null) {
  return useQuery<JobPermission[]>({
    queryKey: ["user-permissions", userId],
    queryFn: async () => {
      const data = await apiFetch<{ permissions: JobPermission[] }>(`/api/permissions/${userId}`);
      return data.permissions;
    },
    enabled: userId !== null,
  });
}

export function useUpdatePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: JobPermission[] }) =>
      apiFetch(`/api/permissions/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      }),
    onSuccess: (_, { userId }) =>
      qc.invalidateQueries({ queryKey: ["user-permissions", userId] }),
  });
}

export function useAllJenkinsJobs() {
  return useQuery<string[]>({
    queryKey: ["permissions-jobs"],
    queryFn: async () => {
      const data = await apiFetch<{ jobs: { name: string }[] }>("/api/permissions/jobs");
      return data.jobs.map((j) => j.name);
    },
  });
}

export function useTriggerHistory(params: TriggerHistoryParams = {}) {
  const { page = 1, limit = 20, job_name } = params;
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (job_name) qs.set("job_name", job_name);

  return useQuery<TriggerHistoryResponse>({
    queryKey: ["trigger-history", page, limit, job_name],
    queryFn: () => apiFetch(`/api/trigger-history?${qs}`),
  });
}
