"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, Circle } from "@/components/ui/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  online_at: string;
}

interface DealCollaborationProps {
  dealId: string;
  currentUserId: string;
}

export function DealCollaboration({ dealId, currentUserId }: DealCollaborationProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get current user profile
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }
      }
    }

    getProfile();
    // supabase is a stable singleton client, so it's safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userProfile) return;

    const channel = supabase.channel(`deal:${dealId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: ActiveUser[] = [];
        
        Object.keys(state).forEach((key) => {
          // Supabase presenceState returns generic records; cast through
          // `unknown` to satisfy TS — runtime shape is what we publish.
          const presences = state[key] as unknown as Array<{
            user_id: string;
            name?: string;
            email?: string;
            role?: string;
            online_at?: string;
          }>;
          presences.forEach((presence) => {
            if (presence.user_id !== currentUserId) {
              users.push({
                id: presence.user_id,
                name: presence.name || 'Anonymous',
                email: presence.email || '',
                role: presence.role,
                online_at: presence.online_at ?? new Date().toISOString(),
              });
            }
          });
        });
        
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            name: userProfile.full_name || userProfile.email,
            email: userProfile.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
    // supabase is a stable singleton client, so it's safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId, currentUserId, userProfile]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span className="font-medium">{activeUsers.length}</span>
          <span className="hidden sm:inline">viewing</span>
        </div>
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-green-500 text-green-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">{user.name}</p>
                {user.role && (
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {activeUsers.length > 5 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted ring-1 ring-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{activeUsers.length - 5}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  {activeUsers.slice(5).map(u => u.name).join(', ')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
