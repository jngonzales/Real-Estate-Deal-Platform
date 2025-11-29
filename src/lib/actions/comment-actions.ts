"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Comment = {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
    role: string;
  };
};

export async function getComments(dealId: string): Promise<{ comments: Comment[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { comments: null, error: "You must be logged in" };
  }

  const { data: comments, error } = await supabase
    .from("deal_comments")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return { comments: null, error: "Failed to fetch comments" };
  }

  // Fetch user info for each comment
  if (comments && comments.length > 0) {
    const userIds = [...new Set(comments.map(c => c.user_id))];
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", userIds);

    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    const commentsWithUsers = comments.map(comment => ({
      ...comment,
      user: userMap.get(comment.user_id) || null,
    }));

    return { comments: commentsWithUsers as Comment[], error: null };
  }

  return { comments: comments as Comment[], error: null };
}

export async function addComment(dealId: string, content: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in" };
  }

  if (!content.trim()) {
    return { success: false, error: "Comment cannot be empty" };
  }

  const { error } = await supabase
    .from("deal_comments")
    .insert({
      deal_id: dealId,
      user_id: user.id,
      content: content.trim(),
    });

  if (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Failed to add comment" };
  }

  revalidatePath(`/dashboard/deals/${dealId}`);
  return { success: true, error: null };
}

export async function deleteComment(commentId: string, dealId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in" };
  }

  // Check if user owns this comment or is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  let deleteQuery = supabase
    .from("deal_comments")
    .delete()
    .eq("id", commentId);

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq("user_id", user.id);
  }

  const { error } = await deleteQuery;

  if (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }

  revalidatePath(`/dashboard/deals/${dealId}`);
  return { success: true, error: null };
}
