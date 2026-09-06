"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserRole, type UserProfile, type UserRole } from "@/lib/actions/user-actions";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roleLabels: Record<UserRole, string> = {
  agent: "Agent",
  underwriter: "Underwriter",
  admin: "Admin",
  investor: "Investor",
};
const roles = Object.keys(roleLabels) as UserRole[];
const summaries = { agent: "Agents", underwriter: "Underwriters", admin: "Admins", investor: "Investors" };
const accessDescriptions = [
  { role: "Agent", access: "Submit deals, update your own deals and manage your settings." },
  { role: "Underwriter", access: "Review the deals you can access, change their stage and complete underwriting." },
  { role: "Admin", access: "Review deals, manage users and assign roles." },
];

export function AdminUsersClient({ users, currentUserId }: { users: UserProfile[]; currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (loading || userId === currentUserId) return;
    setLoading(userId);
    setError(null);

    try {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success("Role updated", { description: "New role: " + roleLabels[newRole] });
        router.refresh();
      }
    } catch {
      setError("Couldn’t update the role. Try again.");
    } finally {
      setLoading(null);
    }
  };

  const counts = [
    { label: "Total users", value: users.length },
    ...roles.map((role) => ({ label: summaries[role], value: users.filter((user) => user.role === role).length })),
  ];

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-6">
      <WorkspaceHeading title="User management" />
      <dl aria-label="User counts" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
        {counts.map(({ label, value }) => (
          <div key={label} className="min-w-0 bg-card p-4 [overflow-wrap:anywhere]">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <p role="alert" className={error ? "rounded-lg border border-border bg-card p-4 text-sm text-destructive" : "sr-only"}>
        {error}
      </p>
      <section aria-labelledby="managed-users" className="rounded-lg border border-border bg-card">
        <h2 id="managed-users" className="p-4 text-lg font-semibold tracking-tight">Users</h2>
        {users.length > 0 ? (
          <ul className="divide-y divide-border border-t border-border">
            {users.map((user) => {
              const name = user.full_name || user.email;
              const isCurrentUser = user.id === currentUserId;

              return (
                <li key={user.id} className="grid min-w-0 gap-3 p-4 [overflow-wrap:anywhere] lg:grid-cols-[minmax(0,1fr)_minmax(0,.5fr)_minmax(0,.5fr)_minmax(0,.6fr)] lg:items-center">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{name}{isCurrentUser && <span className="ms-2 text-xs font-normal text-muted-foreground">(you)</span>}</h3>
                    {user.full_name && <p className="text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Current role</p>
                    <p className="font-medium">{roleLabels[user.role]}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <time dateTime={user.created_at}>{new Date(user.created_at).toLocaleDateString("en-US")}</time>
                  </div>
                  {!isCurrentUser && (
                    <div className="max-w-52 space-y-1">
                      <label htmlFor={"role-" + user.id} className="text-xs text-muted-foreground">
                        Change role<span className="sr-only"> for {name}</span>
                      </label>
                      <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}>
                        <SelectTrigger
                          id={"role-" + user.id}
                          aria-disabled={loading !== null || undefined}
                          className="min-h-11 w-full border-input bg-card text-base aria-disabled:cursor-wait lg:text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role} disabled={loading !== null} className="min-h-11">
                              {roleLabels[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p role="status" className={loading === user.id ? "text-xs text-muted-foreground" : "sr-only"}>
                        {loading === user.id && "Updating role…"}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="border-t border-border p-4 text-sm text-muted-foreground">No users to display.</p>
        )}
      </section>

      <section aria-labelledby="role-permissions" className="rounded-lg border border-border bg-card p-4">
        <h2 id="role-permissions" className="text-lg font-semibold tracking-tight">Role permissions</h2>
        <dl className="mt-3 grid gap-4 md:grid-cols-3">
          {accessDescriptions.map(({ role, access }) => (
            <div key={role}>
              <dt className="text-sm font-semibold">{role}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{access}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
