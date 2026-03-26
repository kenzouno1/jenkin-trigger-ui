"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserFormModal } from "./user-form-modal";
import { ResetPasswordModal } from "./reset-password-modal";
import { useUsers, useUpdateUser, type AdminUser } from "@/hooks/use-admin";
import { UserPlus, Pencil, KeyRound, AlertCircle } from "lucide-react";

export function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const updateUser = useUpdateUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);

  const handleEdit = (user: AdminUser) => {
    setEditTarget(user);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleToggleActive = (user: AdminUser) => {
    updateUser.mutate({ id: user.id, payload: { is_active: !user.is_active } });
  };

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-200">Users</CardTitle>
          <Button size="sm" onClick={handleAdd} className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            Add User
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-2 px-6 pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md bg-zinc-800" />
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-6 py-4 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              Failed to load users
            </div>
          )}

          {users && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="px-6 py-2.5 text-left font-medium">Username</th>
                    <th className="px-4 py-2.5 text-left font-medium">Email</th>
                    <th className="px-4 py-2.5 text-left font-medium">Role</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-zinc-200">{user.username}</td>
                      <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className={user.role === "admin"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${user.is_active ? "text-green-400" : "text-zinc-500"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-zinc-400 hover:text-yellow-300"
                            onClick={() => setResetTarget(user)}
                            title="Reset password"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                          {user.role !== "admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-7 px-2 text-xs ${user.is_active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}`}
                              onClick={() => handleToggleActive(user)}
                              disabled={updateUser.isPending}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-zinc-500">No users found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editUser={editTarget}
      />

      <ResetPasswordModal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        user={resetTarget}
      />
    </>
  );
}
