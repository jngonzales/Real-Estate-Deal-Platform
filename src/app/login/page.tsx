"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, signup } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Calculator, Users, CheckCircle, BarChart3, UserPlus, Loader2 } from "@/components/ui/icons";
import { Turnstile, TurnstileRef } from '@/components/security';

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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Full-screen loading overlay during authentication */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/25 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white">
                {isLogin ? "Signing you in..." : "Creating your account..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? "Preparing your dashboard" : "Setting up your workspace"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card p-12 flex-col justify-between relative overflow-hidden">
        {/* Header */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DealFlow</span>
          </Link>
          <p className="text-muted-foreground mt-2">Real Estate Deal Analysis Platform</p>
        </div>

        {/* Main headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Analyze deals
              <br />
              <span className="text-white">
                like a pro
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              Professional-grade investment analysis tools built for serious real estate investors and teams.
            </p>
          </div>
          
          {/* Feature list */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border backdrop-blur">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">6 Pro Calculators</h3>
                <p className="text-muted-foreground text-sm">ARV, MAO, ROI, Repairs, 1031, Financing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border backdrop-blur">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Deal Scoring</h3>
                <p className="text-muted-foreground text-sm">Get instant 1-100 deal quality scores</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border backdrop-blur">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Team Collaboration</h3>
                <p className="text-muted-foreground text-sm">Submit → Analyze → Approve workflow</p>
              </div>
            </div>
          </div>

          {/* Value proposition instead of fake social proof */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-foreground/90">Make faster, data-driven investment decisions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-foreground/90">Professional PDF reports for investors & lenders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-foreground/90">Built for wholesalers, flippers, and buy-and-hold investors</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <p className="text-muted-foreground text-sm">
            Professional-grade tools for smarter investing
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">DealFlow</span>
            </Link>
            <p className="text-muted-foreground text-sm">Real Estate Deal Analysis</p>
          </div>

          {/* Invitation Banner */}
          {invitationInfo && (
            <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/25">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <UserPlus className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">You&apos;ve been invited!</p>
                  <p className="text-sm text-muted-foreground">
                    Join <span className="text-emerald-400 font-medium">{invitationInfo.organization_name}</span> as {invitationInfo.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Card className="border-border bg-muted/40 backdrop-blur shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                {invitationInfo 
                  ? "Join your team" 
                  : isLogin 
                    ? "Welcome back" 
                    : "Create your account"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {invitationInfo
                  ? "Create your account to accept the invitation"
                  : isLogin
                    ? "Sign in to continue analyzing deals"
                    : "Start analyzing deals in under 60 seconds"}
              </CardDescription>
            </CardHeader>
            <form action={handleSubmit}>
              <CardContent className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required={!isLogin}
                      className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    readOnly={!!inviteToken && !!invitationInfo?.email}
                    className={`bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 ${
                      inviteToken && invitationInfo?.email ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  />
                  {inviteToken && invitationInfo?.email && (
                    <p className="text-xs text-muted-foreground">
                      This email was invited by the admin
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    {isLogin && (
                      <Link href="/auth/update-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Check your email!</p>
                        <p className="mt-1 text-emerald-400/80">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Turnstile CAPTCHA - Shows on signup or after 3 failed login attempts */}
                {showCaptcha && (
                  <div className="flex flex-col items-center gap-2">
                    {isLogin && failedAttempts >= 3 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
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
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-black/30 transition-all duration-200 disabled:opacity-70" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    isLogin ? "Sign in" : "Create account"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    {isLogin ? "Sign up free" : "Sign in"}
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Terms notice */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-emerald-400 underline hover:text-emerald-300 font-medium">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-emerald-400 underline hover:text-emerald-300 font-medium">Privacy Policy</Link>
          </p>

          {/* Try calculators CTA */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm mb-2">Not ready to sign up?</p>
            <Link 
              href="/calculators" 
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm"
            >
              <Calculator className="h-4 w-4" />
              Try our free calculators
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Wrap the component in Suspense for useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
