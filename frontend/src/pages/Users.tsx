// File: src/components/Users.tsx (FULLY FIXED)

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  User,
  AtSign,
  Lock,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

import { authenticatedFetch } from "@/lib/api";

/* ---------- FIXED API CALLS (Uses authenticatedFetch + env URL) ---------- */
const getAdmins = () => authenticatedFetch("/admin");

const createAdmin = (data: any) =>
  authenticatedFetch("/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });

const updateAdmin = (id: string, data: any) =>
  authenticatedFetch(`/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

const deleteAdmin = (id: string) =>
  authenticatedFetch(`/admin/${id}`, {
    method: "DELETE",
  });

/* ------------------------------------------------------------------------ */

export default function Users() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Protect route
  if (user?.role !== "superadmin") return <Navigate to="/dashboard" replace />;

  // UI state for Add/Edit Dialog
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  // UI state for Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [deletingAdminUsername, setDeletingAdminUsername] = useState<
    string | null
  >(null);

  // Fetch admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      toast.success("Admin created successfully.");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => toast.error(err?.message || "Create failed"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAdmin(id, data),
    onSuccess: () => {
      toast.success("Admin updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      resetForm();
      setOpen(false);
      setIsEditing(false);
      setEditingId(null);
    },
    onError: (err: any) => toast.error(err?.message || "Update failed"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      toast.success(
        `Admin "${deletingAdminUsername || "User"}" deleted successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setDeleteDialogOpen(false);
      setDeletingAdminId(null);
      setDeletingAdminUsername(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Delete failed");
      setDeleteDialogOpen(false);
      setDeletingAdminId(null);
      setDeletingAdminUsername(null);
    },
  });

  /* ---------- Form Handling ---------- */
  function resetForm() {
    setForm({ username: "", email: "", password: "", role: "admin" });
    setConfirmPassword("");
    setShowPass(false);
    setShowConfirmPass(false);
  }

  function openAdd() {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(admin: any) {
    setForm({
      username: admin.username || "",
      email: admin.email || "",
      password: "",
      role: admin.role || "admin",
    });
    setConfirmPassword("");
    setIsEditing(true);
    setEditingId(admin._id);
    setOpen(true);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!form.username || !form.email) {
      toast.error("Username and email are required");
      return;
    }

    if (!isEditing) {
      // create flow: password required
      if (!form.password) {
        toast.error("Password is required");
        return;
      }
      if (form.password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      createMutation.mutate(form);
      return;
    }

    // editing: if password present, require confirm match
    if (form.password && form.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!editingId) {
      toast.error("No admin selected for editing");
      return;
    }

    // Prepare payload: do NOT send empty password
    const payload: any = {
      username: form.username,
      email: form.email,
      role: form.role,
    };
    if (form.password) payload.password = form.password;

    updateMutation.mutate({ id: editingId, data: payload });
  }

  /* ---------- Delete Logic ---------- */
  function openDeleteDialog(admin: any) {
    setDeletingAdminId(admin._id);
    setDeletingAdminUsername(admin.username);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (deletingAdminId) {
      deleteMutation.mutate(deletingAdminId);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage admin users and their permissions
          </p>
        </div>

        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={openAdd}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Admin
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setIsEditing(false);
            setEditingId(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Edit Admin" : "Add Admin"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="grid gap-2">
              <Label>Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-9"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label>Email</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="email"
                  className="pl-9"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="example@mail.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label>
                {isEditing
                  ? "Password (leave blank to keep current)"
                  : "Password"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type={showPass ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder={
                    isEditing
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type={showConfirmPass ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPass ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  className="w-full pl-10 p-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-orange-500"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {isEditing
                  ? updateMutation.isLoading
                    ? "Saving..."
                    : "Save Changes"
                  : createMutation.isLoading
                  ? "Creating..."
                  : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader className="items-center text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <DialogTitle className="text-xl font-semibold text-red-600">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to permanently delete the admin user{" "}
              <span className="font-bold text-foreground">
                "{deletingAdminUsername}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : admins?.length > 0 ? (
                  admins.map((admin: any) => (
                    <TableRow key={admin._id}>
                      <TableCell className="font-medium">
                        {admin.username}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize border-orange-500 text-orange-500"
                        >
                          {admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(admin)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
