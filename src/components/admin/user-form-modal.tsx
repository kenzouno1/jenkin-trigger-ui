"use client";

import { useEffect, useState } from "react";
import { z } from "zod/v4";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser, useUpdateUser, type AdminUser } from "@/hooks/use-admin";
import { Loader2, AlertCircle } from "lucide-react";

const createSchema = z.object({
  username: z.string().min(3, "At least 3 chars"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "At least 6 chars"),
  role: z.enum(["user", "admin"]),
});

const editSchema = z.object({
  username: z.string().min(3, "At least 3 chars"),
  email: z.email("Invalid email"),
  role: z.enum(["user", "admin"]),
});

interface Props {
  open: boolean;
  onClose: () => void;
  editUser?: AdminUser | null;
}

export function UserFormModal({ open, onClose, editUser }: Props) {
  const isEdit = !!editUser;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editUser) {
      setUsername(editUser.username);
      setEmail(editUser.email);
      setRole(editUser.role);
      setPassword("");
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
    }
    setErrors({});
  }, [editUser, open]);

  const handleSubmit = async () => {
    setErrors({});
    if (isEdit) {
      const result = editSchema.safeParse({ username, email, role });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
        setErrors(errs);
        return;
      }
      await updateUser.mutateAsync({ id: editUser!.id, payload: { username, email, role } });
    } else {
      const result = createSchema.safeParse({ username, email, password, role });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
        setErrors(errs);
        return;
      }
      await createUser.mutateAsync({ username, email, password, role });
    }
    onClose();
  };

  const isPending = createUser.isPending || updateUser.isPending;
  const mutError = createUser.error?.message || updateUser.error?.message;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="um-username">Username</Label>
            <Input id="um-username" value={username} onChange={(e) => setUsername(e.target.value)} />
            {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="um-email">Email</Label>
            <Input id="um-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="um-password">Password</Label>
              <Input id="um-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mutError && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {mutError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
