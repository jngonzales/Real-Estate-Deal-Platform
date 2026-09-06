import { redirect } from "next/navigation";
import { getCurrentUserProfile, getAllUsers } from "@/lib/actions/user-actions";
import { AdminUsersClient } from "./admin-users-client";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default async function AdminUsersPage() {
  const { profile, error: profileError } = await getCurrentUserProfile();

  if (profileError || !profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { users, error } = await getAllUsers();

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <WorkspaceHeading title="User management" />
        <div role="alert" className="rounded-lg border border-border bg-card p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return <AdminUsersClient users={users || []} currentUserId={profile.id} />;
}
