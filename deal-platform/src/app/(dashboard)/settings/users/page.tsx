"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Clock3, Plus, ShieldAlert, UserCog, UserX } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constants";
import { formatRelativeDate, generateId } from "@/lib/utils";
import { users as initialUsers } from "@/mock-data";
import type { User } from "@/types";

const roleBadgeClasses: Record<User["role"], string> = {
  Admin: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Deal Team": "border-blue-200 bg-blue-50 text-blue-700",
  "Read-Only": "border-slate-200 bg-slate-100 text-slate-700",
};

const addUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Enter a valid email address."),
  role: z.enum(USER_ROLES),
});

const roleSchema = z.object({
  role: z.enum(USER_ROLES),
});

type AddUserFormData = z.infer<typeof addUserSchema>;
type RoleFormData = z.infer<typeof roleSchema>;

function SessionExpiredBanner({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-950">
      <Clock3 className="h-4 w-4" />
      <AlertTitle>Session timeout demo</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Toggle the 30-minute inactivity state to preview the forced logout experience.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onToggle}>
            {visible ? "Hide Expired Session Banner" : "Show Expired Session Banner"}
          </Button>
          {visible && (
            <div className="rounded-md border border-amber-200 bg-white px-3 py-2 text-sm">
              <span className="font-medium">
                Your session has expired. Please log in again.
              </span>{" "}
              <Link href="/login" className="underline underline-offset-4">
                Return to login
              </Link>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<User[]>(
    initialUsers.map((user, index) =>
      index === initialUsers.length - 1 ? { ...user, isActive: false } : user
    )
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const addUserForm = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema as any) as any,
    defaultValues: {
      name: "",
      email: "",
      role: "Deal Team",
    },
  });

  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema as any) as any,
    defaultValues: {
      role: "Deal Team",
    },
  });

  const activeAdminCount = useMemo(
    () => users.filter((user) => user.role === "Admin" && user.isActive).length,
    [users]
  );

  function openRoleDialog(user: User) {
    setSelectedUser(user);
    roleForm.reset({ role: user.role });
    setIsRoleDialogOpen(true);
  }

  function handleDeactivate(user: User) {
    const isLastAdmin = user.role === "Admin" && user.isActive && activeAdminCount === 1;

    if (isLastAdmin) {
      toast.error("You cannot deactivate the last Admin.");
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id ? { ...currentUser, isActive: false } : currentUser
      )
    );
    toast.success(`${user.name} has been deactivated.`);
  }

  function handleAddUser(data: AddUserFormData) {
    setUsers((currentUsers) => [
      {
        id: generateId(),
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: undefined,
      },
      ...currentUsers,
    ]);
    toast.success("User added successfully.");
    addUserForm.reset({
      name: "",
      email: "",
      role: "Deal Team",
    });
    setIsAddDialogOpen(false);
  }

  function handleSaveRole(data: RoleFormData) {
    if (!selectedUser) {
      return;
    }

    const removingLastAdmin =
      selectedUser.role === "Admin" &&
      selectedUser.isActive &&
      data.role !== "Admin" &&
      activeAdminCount === 1;

    if (removingLastAdmin) {
      toast.error("You cannot remove the Admin role from the last Admin.");
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === selectedUser.id ? { ...currentUser, role: data.role } : currentUser
      )
    );
    toast.success("Role updated successfully.");
    setIsRoleDialogOpen(false);
    setSelectedUser(null);
  }

  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (user) => (
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.id}</p>
        </div>
      ),
      accessor: (user) => user.name,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => (
        <Badge variant="outline" className={roleBadgeClasses[user.role]}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (user) => (
        <Badge
          variant="outline"
          className={
            user.isActive
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-gray-200 bg-gray-100 text-gray-700"
          }
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      accessor: (user) => (user.isActive ? "Active" : "Inactive"),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      sortable: true,
      render: (user) =>
        user.lastLoginAt ? formatRelativeDate(user.lastLoginAt) : "Never logged in",
      accessor: (user) => user.lastLoginAt ?? "",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[220px]",
      render: (user) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              openRoleDialog(user);
            }}
          >
            <UserCog className="mr-2 h-4 w-4" />
            Change Role
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!user.isActive}
            className="text-destructive hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              handleDeactivate(user);
            }}
          >
            <UserX className="mr-2 h-4 w-4" />
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Manage access levels, active accounts, and role assignments for the deal team."
        actions={
          <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <SessionExpiredBanner
        visible={showSessionExpired}
        onToggle={() => setShowSessionExpired((current) => !current)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter((user) => user.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-3xl">{activeAdminCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Read-Only Seats</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter((user) => user.role === "Read-Only").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Admin controls</AlertTitle>
        <AlertDescription>
          Admins can add users, change roles, and deactivate accounts. The last active Admin cannot
          be downgraded or deactivated.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Team access</CardTitle>
          <CardDescription>
            Role changes take effect immediately, and deactivated users lose access at the next login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={users as unknown as Record<string, unknown>[]}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a new mock user account and assign their initial access level.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Jordan Blake" {...addUserForm.register("name")} />
              {addUserForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {addUserForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jordan.blake@avriocleanfund.com"
                {...addUserForm.register("email")}
              />
              {addUserForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {addUserForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={addUserForm.watch("role")}
                onValueChange={(value) => {
                  if (value) {
                    addUserForm.setValue("role", value as User["role"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addUserForm.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {addUserForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addUserForm.formState.isSubmitting}>
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Role changes take effect immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={roleForm.handleSubmit(handleSaveRole)} className="space-y-4">
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <p className="font-medium">{selectedUser?.name}</p>
              <p className="text-muted-foreground">{selectedUser?.email}</p>
            </div>

            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                value={roleForm.watch("role")}
                onValueChange={(value) => {
                  if (value) {
                    roleForm.setValue("role", value as User["role"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roleForm.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {roleForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <Alert className="border-blue-200 bg-blue-50 text-blue-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Role changes take effect immediately.</AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={roleForm.formState.isSubmitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
