import { redirect } from "next/navigation";
import { getCurrentUserProfile, getAllUsers } from "@/lib/actions/user-actions";
import { AdminUsersClient } from "./admin-users-client";

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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and their roles.
          </p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return <AdminUsersClient users={users || []} currentUserId={profile.id} />;
}
