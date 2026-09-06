"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "@/components/ui/icons";
import { PublicHeading, PublicPage, publicAction, publicField } from "@/components/layout/public-page";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalidField, setInvalidField] = useState<"password" | "confirmation" | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInvalidField(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setInvalidField("password");
      passwordRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setInvalidField("confirmation");
      confirmPasswordRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Redirect to settings after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/settings");
        }, 2000);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPage className="max-w-lg">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <PublicHeading>Update password</PublicHeading>
        <div role="status">
          {success && <p className="mt-4">Password updated. Opening settings…</p>}
        </div>
        {!success && (
          <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  ref={passwordRef}
                  id="new-password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  aria-invalid={invalidField === "password" || undefined}
                  aria-describedby={invalidField === "password" ? "password-hint reset-error" : "password-hint"}
                  className={publicField + " pe-12"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                  aria-controls="new-password confirm-password"
                  className={publicAction + " absolute inset-y-0 end-0 size-11"}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </Button>
              </div>
              <p id="password-hint" className="text-sm text-muted-foreground">Use at least 6 characters.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                ref={confirmPasswordRef}
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                aria-invalid={invalidField === "confirmation" || undefined}
                aria-describedby={invalidField === "confirmation" ? "reset-error" : undefined}
                className={publicField}
              />
            </div>

            <div role="alert" className={error ? "rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm" : "sr-only"}>
              {error && <p id="reset-error" className="break-words">{error}</p>}
            </div>
            <div role="status" className="sr-only">{loading && "Updating password…"}</div>
            <Button type="submit" className={publicAction + " w-full"} disabled={loading}>
              {loading ? "Updating password…" : "Update password"}
            </Button>
          </form>
        )}
      </section>
    </PublicPage>
  );
}
