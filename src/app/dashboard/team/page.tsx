"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  token: string;
}

interface Organization {
  id: string;
  name: string;
  settings: {
    account_type?: string;
  };
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  async function fetchTeamData() {
    setLoadError(null);
    const supabase = createClient();
    
    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) return;

      // Get organization details
      const { data: org, error: organizationError } = await supabase
        .from("organizations")
        .select("id, name, settings")
        .eq("id", profile.organization_id)
        .single();

      setOrganization(org);

      // Get team members
      const { data: teamMembers, error: membersError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: true });

      setMembers(teamMembers || []);

      // Get pending invitations
      const { data: pendingInvites, error: pendingError } = await supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setInvitations(pendingInvites || []);
      if (organizationError || membersError || pendingError) {
        setLoadError("Some team information could not be loaded.");
      }
    } catch (err) {
      console.error("Error fetching team data:", err);
      setLoadError("Team information could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function sendInvitation() {
    if (!inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setInviting(true);
    setError(null);
    setSuccess(null);
    setLastInviteLink(null);
    setLinkCopied(false);

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send invitation");
        return;
      }

      // Save the invite link for easy copying
      if (data.inviteLink) {
        setLastInviteLink(data.inviteLink);
      }

      if (data.emailSent) {
        setSuccess(`Invitation email sent to ${inviteEmail}!`);
      } else {
        setSuccess(`Invitation created for ${inviteEmail}. Copy the link below and share it manually:`);
      }
      setInviteEmail("");
      fetchTeamData(); // Refresh the list
    } catch (err) {
      console.error("Error sending invitation:", err);
      setError("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }

  async function cancelInvitation(invitationId: string) {
    setCancellingId(invitationId);
    setInvitationError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);
      if (error) throw error;
      
      fetchTeamData();
    } catch (err) {
      console.error("Error cancelling invitation:", err);
      setInvitationError("Could not cancel the invitation. Try again.");
    } finally {
      setCancellingId(null);
    }
  }

  async function copyInviteLink(token: string, id: string) {
    setInvitationError(null);
    const link = `${window.location.origin}/login?invite=${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setInvitationError("Could not copy the invitation link. Try again.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <WorkspaceHeading title="Team" />
        <p role="status" className="text-muted-foreground">Loading your team…</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading title="Team" description={organization?.name} />

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 p-4">
          <p role="alert">{loadError}</p>
          <Button type="button" variant="outline" className="min-h-11" onClick={fetchTeamData}>Try again</Button>
        </div>
      )}

      <section aria-labelledby="invite-title" className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 id="invite-title" className="text-lg font-semibold">Invite a team member</h2>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!inviting) void sendInvitation();
          }}
          className="mt-4 grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)_auto]"
        >
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="min-h-11 md:text-base"
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger id="invite-role" className="min-h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="underwriter">Underwriter</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={inviting} className="min-h-11 justify-self-start">
            {inviting ? "Sending invitation…" : "Send invitation"}
          </Button>
        </form>
        <div role="alert">
          {error && <p className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm [overflow-wrap:anywhere]">{error}</p>}
        </div>
        <div role="status">
          {success && <p className="mt-4 rounded-lg bg-muted p-3 text-sm [overflow-wrap:anywhere]">{success}</p>}
        </div>
        {lastInviteLink && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="last-invitation-link">Invitation link</Label>
              <Input id="last-invitation-link" value={lastInviteLink} readOnly className="min-h-11" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 self-start sm:self-auto"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lastInviteLink);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                } catch {
                  setError("Could not copy the invitation link. You can copy it from the field.");
                }
              }}
            >
              {linkCopied ? "Link copied" : "Copy link"}
            </Button>
          </div>
        )}
      </section>

      <section aria-labelledby="team-members" className="rounded-lg border border-border bg-card">
        <h2 id="team-members" className="p-4 text-lg font-semibold sm:px-6">
          Team members{" "}
          {(!loadError || members.length > 0) && (
            <span className="text-sm font-medium tabular-nums text-muted-foreground">({members.length})</span>
          )}
        </h2>
        {members.length > 0 ? (
          <ul className="divide-y divide-border border-t border-border">
            {members.map((member) => (
              <li key={member.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 p-4 sm:px-6">
                <div className="min-w-0 flex-1 basis-36 [overflow-wrap:anywhere]">
                  <p className="font-medium">{member.full_name || "Unnamed"}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                  <div><dt className="sr-only">Role</dt><dd className="capitalize">{member.role}</dd></div>
                  <div className="flex gap-1 text-muted-foreground">
                    <dt>Joined</dt><dd>{format(new Date(member.created_at), "MMM d, yyyy")}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-4 text-sm text-muted-foreground sm:px-6">
            {loadError ? "Team members could not be listed." : "No team members to show."}
          </p>
        )}
      </section>

      <section aria-labelledby="pending-invitations" className="rounded-lg border border-border bg-card">
        <h2 id="pending-invitations" className="p-4 text-lg font-semibold sm:px-6">
          Pending invitations{" "}
          {(!loadError || invitations.length > 0) && (
            <span className="text-sm font-medium tabular-nums text-muted-foreground">({invitations.length})</span>
          )}
        </h2>
        <div role="alert">
          {invitationError && <p className="mx-4 mb-4 rounded-lg border border-destructive/40 p-3 text-sm sm:mx-6">{invitationError}</p>}
        </div>
        {invitations.length > 0 ? (
          <ul className="divide-y divide-border border-t border-border">
            {invitations.map((invite) => (
              <li key={invite.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 p-4 sm:px-6">
                <div className="min-w-0 flex-1 basis-36 [overflow-wrap:anywhere]">
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="capitalize">{invite.role}</span>
                    {" · Expires "}{format(new Date(invite.expires_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    aria-label={(copiedId === invite.id ? "Copied link for " : "Copy link for ") + invite.email}
                    onClick={() => copyInviteLink(invite.token, invite.id)}
                  >
                    {copiedId === invite.id ? "Copied" : "Copy link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11 text-destructive"
                    aria-label={(cancellingId === invite.id ? "Cancelling invitation for " : "Cancel invitation for ") + invite.email}
                    disabled={cancellingId !== null}
                    onClick={() => cancelInvitation(invite.id)}
                  >
                    {cancellingId === invite.id ? "Cancelling…" : "Cancel"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-4 text-sm text-muted-foreground sm:px-6">
            {loadError ? "Invitations could not be listed." : "There are no pending invitations."}
          </p>
        )}
      </section>
    </div>
  );
}
