"use client";

import { useState, useEffect } from "react";
import { getComments, addComment, deleteComment, type Comment } from "@/lib/actions/comment-actions";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Trash2, User } from "lucide-react";

interface CommentsProps {
  dealId: string;
  isAdmin?: boolean;
}

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  underwriter: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
};

export function Comments({ dealId, isAdmin = false }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchComments() {
      const result = await getComments(dealId);
      if (isMounted && result.comments) {
        setComments(result.comments);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    fetchComments();
    
    return () => {
      isMounted = false;
    };
  }, [dealId]);

  const loadComments = async () => {
    const result = await getComments(dealId);
    if (result.comments) {
      setComments(result.comments);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await addComment(dealId, newComment);

    if (result.error) {
      setError(result.error);
    } else {
      setNewComment("");
      await loadComments();
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const result = await deleteComment(commentId, dealId);
    if (!result.error) {
      await loadComments();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <MessageSquare className="h-5 w-5" />
          Notes & Comments
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to add a note</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {comment.user?.full_name || comment.user?.email || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2">
                      {comment.user?.role && (
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${roleColors[comment.user.role] || "bg-slate-100 text-slate-700"}`}>
                          {comment.user.role}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-opacity"
                  title={isAdmin ? "Delete comment (admin)" : "Delete your comment"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap pl-10">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        {error && (
          <div className="mb-3 rounded-md bg-red-500/10 p-2 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a note or comment..."
            className="flex-1 min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="self-end px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
