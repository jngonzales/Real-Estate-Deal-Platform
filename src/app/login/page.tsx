"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, signup } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "@/components/ui/icons";
import { PublicHeading, PublicPage, publicAction, publicField, publicLink } from "@/components/layout/public-page";
import { Turnstile, type TurnstileRef } from "@/components/security";

interface InvitationInfo {
  organization_name: string;
  role: string;
  email: string;  // The invited email address
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const redirectUrl = searchParams.get("redirect");
  const selectedPlan = searchParams.get("plan");
  
  // Initialize isLogin based on whether there's an invite token
  const [isLogin, setIsLogin] = useState(!inviteToken);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const turnstileRef = useRef<TurnstileRef>(null);
  
  // Show CAPTCHA after 3 failed login attempts or always on signup
  const showCaptcha = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && 
    (!isLogin || failedAttempts >= 3);

  // Fetch invitation details if there's an invite token
  useEffect(() => {
    if (inviteToken) {
      // Fetch invitation details
      fetch(`/api/team/invitation?token=${inviteToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.organization_name) {
            setInvitationInfo(data);
            // Auto-fill the invited email
            if (data.email) {
              setInvitedEmail(data.email);
            }
          }
        })
        .catch(() => {});
    }
  }, [inviteToken]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Require Turnstile verification if CAPTCHA is showing
    if (showCaptcha) {
      if (!turnstileToken) {
        setError("Please complete the security verification");
        setLoading(false);
        return;
      }
      formData.append("turnstileToken", turnstileToken);
    }

    // Add invite token to form data if present
    if (inviteToken) {
      formData.append("inviteToken", inviteToken);
    }

    // Add redirect URL if present (e.g., from pricing page)
    if (redirectUrl) {
      // Include plan param if present
      const finalRedirect = selectedPlan ? `${redirectUrl}?plan=${selectedPlan}` : redirectUrl;
      formData.append("redirect", finalRedirect);
    }

    const result = isLogin ? await login(formData) : await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      // Track failed login attempts
      if (isLogin) {
        setFailedAttempts(prev => prev + 1);
      }
      // Reset turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } else if (result && 'success' in result && result.success) {
      setSuccessMessage((result as { success: boolean; message: string }).message);
      setLoading(false);
      // Reset failed attempts on success
      setFailedAttempts(0);
    }
  }

  const inviteEmailLocked = Boolean(inviteToken && invitationInfo?.email);

  return (
    <PublicPage className="max-w-lg">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <PublicHeading>{isLogin ? "Sign in" : invitationInfo ? "Join your team" : "Create your account"}</PublicHeading>
        {invitationInfo && (
          <p className="mt-3 break-words text-muted-foreground">
            Join <strong className="font-medium text-foreground">{invitationInfo.organization_name}</strong> as {invitationInfo.role}.
          </p>
        )}
        <form action={handleSubmit} className="mt-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" autoComplete="name" required className={publicField} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={invitedEmail}
                onChange={(event) => setInvitedEmail(event.target.value)}
                readOnly={inviteEmailLocked}
                aria-describedby={inviteEmailLocked ? "invited-email-hint" : undefined}
                className={publicField}
              />
              {inviteEmailLocked && (
                <p id="invited-email-hint" className="text-sm text-muted-foreground">
                  Use the email address that received the invitation.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  aria-describedby={isLogin ? undefined : "password-hint"}
                  className={publicField + " pe-12"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-controls="password"
                  className={publicAction + " absolute inset-y-0 end-0 size-11"}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </Button>
              </div>
              {isLogin ? (
                <Link href="/auth/update-password" className={publicLink + " inline-flex min-h-11 items-center text-sm"}>
                  Forgot password?
                </Link>
              ) : (
                <p id="password-hint" className="text-sm text-muted-foreground">Use at least 6 characters.</p>
              )}
            </div>
            {showCaptcha && (
              <div className="flex flex-col items-center gap-2 [&>div]:shrink-0">
                {isLogin && failedAttempts >= 3 && (
                  <p className="text-sm text-muted-foreground">
                    Too many failed attempts. Please verify you&apos;re human.
                  </p>
                )}
                <Turnstile
                  ref={turnstileRef}
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
            )}
          </div>

          <div role="alert">
            {error && (
              <p className="mt-4 break-words rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground">
                <strong>{isLogin ? "Sign-in failed. " : "Account creation failed. "}</strong>
                {error}
              </p>
            )}
          </div>
          <div role="status">
            {successMessage && (
              <div className="mt-4 break-words rounded-lg border border-border bg-muted p-3 text-sm">
                <p className="font-medium">Check your email</p>
                <p className="mt-1 text-muted-foreground">{successMessage}</p>
              </div>
            )}
          </div>
          <div role="status" className="sr-only">
            {loading && (isLogin ? "Signing in…" : "Creating account…")}
          </div>
          <Button type="submit" className={publicAction + " mt-4 w-full"} disabled={loading}>
            {loading ? (isLogin ? "Signing in…" : "Creating account…") : (isLogin ? "Sign in" : "Create account")}
          </Button>
        </form>

        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin ? "New to LotMerit?" : "Already have an account?"}{" "}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setShowPassword(false);
            }}
            className={publicLink + " inline-flex min-h-11 items-center font-medium disabled:opacity-60"}
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/terms" className={publicLink}>Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className={publicLink}>Privacy Policy</Link>.
      </p>
      <Link href="/calculators" className={publicLink + " mt-1 inline-flex min-h-11 items-center text-sm"}>
        Browse calculators
      </Link>
    </PublicPage>
  );
}

function LoginLoading() {
  return (
    <PublicPage className="max-w-lg">
      <p role="status" className="text-muted-foreground">Loading sign-in form…</p>
    </PublicPage>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
