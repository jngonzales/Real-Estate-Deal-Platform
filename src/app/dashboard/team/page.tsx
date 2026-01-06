"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  Copy,
  Trash2,
  Building2,
} from "lucide-react";
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
      const { data: org } = await supabase
        .from("organizations")
        .select("id, name, settings")
        .eq("id", profile.organization_id)
        .single();

      setOrganization(org);

      // Get team members
      const { data: teamMembers } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: true });

      setMembers(teamMembers || []);

      // Get pending invitations
      const { data: pendingInvites } = await supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setInvitations(pendingInvites || []);
    } catch (err) {
      console.error("Error fetching team data:", err);
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
    try {
      const supabase = createClient();
      await supabase
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);
      
      fetchTeamData();
    } catch (err) {
      console.error("Error cancelling invitation:", err);
    }
  }

  function copyInviteLink(token: string, id: string) {
    const link = `${window.location.origin}/login?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "underwriter":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "agent":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "investor":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400">
            Manage your team members and invitations
          </p>
        </div>
        {organization && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-white">{organization.name}</span>
          </div>
        )}
      </div>

      {/* Invite Form */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Send an invitation to add someone to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className="text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="role" className="text-slate-300">
                Role
              </Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="underwriter">Underwriter</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={sendInvitation}
                disabled={inviting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
              {lastInviteLink && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <Input
                    value={lastInviteLink}
                    readOnly
                    className="bg-slate-900 border-slate-600 text-slate-300 text-sm"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(lastInviteLink);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-slate-600 hover:bg-slate-700"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-blue-500" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Member</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="border-slate-800">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">
                        {member.full_name || "Unnamed"}
                      </p>
                      <p className="text-sm text-slate-400">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(member.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Expires</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite.id} className="border-slate-800">
                    <TableCell className="text-white">{invite.email}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${getRoleBadgeColor(
                          invite.role
                        )}`}
                      >
                        {invite.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(invite.expires_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token, invite.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedId === invite.id ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invite.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
