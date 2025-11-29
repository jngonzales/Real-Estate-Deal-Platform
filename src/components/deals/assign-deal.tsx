"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { assignDeal } from "@/lib/actions/deal-actions";
import { getUnderwriters, type UserProfile } from "@/lib/actions/user-actions";
import { UserPlus, Check, X, ChevronDown } from "lucide-react";

interface AssignDealProps {
  dealId: string;
  currentAssigneeId: string | null;
  currentAssigneeName?: string | null;
}

export function AssignDeal({ dealId, currentAssigneeId, currentAssigneeName }: AssignDealProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [underwriters, setUnderwriters] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUnderwriters() {
      const result = await getUnderwriters();
      if (result.underwriters) {
        setUnderwriters(result.underwriters);
      }
    }
    loadUnderwriters();
  }, []);

  const handleAssign = async (assigneeId: string | null) => {
    setIsLoading(true);
    setError(null);

    const result = await assignDeal(dealId, assigneeId);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        {currentAssigneeName || "Unassigned"}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-border bg-card py-1 shadow-lg">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Assign to
          </div>

          {/* Unassign option */}
          <button
            onClick={() => handleAssign(null)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted ${
              !currentAssigneeId ? "bg-muted" : ""
            }`}
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span>Unassigned</span>
            {!currentAssigneeId && <Check className="ml-auto h-4 w-4 text-blue-600" />}
          </button>

          <div className="my-1 border-t border-border" />

          {/* Underwriters list */}
          {underwriters.map((underwriter) => (
            <button
              key={underwriter.id}
              onClick={() => handleAssign(underwriter.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted ${
                currentAssigneeId === underwriter.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                {(underwriter.full_name || underwriter.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">
                  {underwriter.full_name || underwriter.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {underwriter.role}
                </p>
              </div>
              {currentAssigneeId === underwriter.id && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}

          {underwriters.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No underwriters found
            </p>
          )}

          {error && (
            <p className="px-3 py-2 text-sm text-red-500">{error}</p>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
