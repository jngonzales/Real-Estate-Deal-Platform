"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Shield, ShieldCheck, Smartphone, Copy, Check, Loader2 } from "lucide-react"

interface TwoFactorSetupProps {
  isEnabled?: boolean
  onStatusChange?: (enabled: boolean) => void
}

export function TwoFactorSetup({ isEnabled = false, onStatusChange }: TwoFactorSetupProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"intro" | "qr" | "verify" | "backup">("intro")
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  
  const supabase = createClient()

  const startSetup = async () => {
    setLoading(true)
    try {
      // Enroll in TOTP MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "DealFlow Authenticator",
      })

      if (error) throw error

      if (data) {
        setQrCode(data.totp.qr_code)
        setSecret(data.totp.secret)
        setStep("qr")
      }
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || "Failed to start 2FA setup")
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code")
      return
    }

    setLoading(true)
    try {
      // Get the current factors to find the one we just enrolled
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp?.find(f => f.factor_type === "totp" && !f.friendly_name?.includes("verified"))

      if (!totpFactor) {
        throw new Error("No unverified factor found")
      }

      // Create a challenge and verify
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      })

      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      // Generate backup codes (mock - in production these would come from the server)
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )
      setBackupCodes(codes)
      setStep("backup")
      
      toast.success("2FA enabled successfully!")
      onStatusChange?.(true)
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || "Invalid verification code")
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    setLoading(true)
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verifiedFactor = factors?.totp?.find(f => f.status === "verified")

      if (verifiedFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: verifiedFactor.id,
        })
        if (error) throw error
      }

      toast.success("2FA disabled")
      onStatusChange?.(false)
      setOpen(false)
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || "Failed to disable 2FA")
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success("Backup codes copied to clipboard")
  }

  const resetDialog = () => {
    setStep("intro")
    setQrCode(null)
    setSecret(null)
    setVerifyCode("")
    setBackupCodes([])
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button variant={isEnabled ? "outline" : "default"} className="gap-2">
          {isEnabled ? (
            <>
              <ShieldCheck className="h-4 w-4 text-green-500" />
              2FA Enabled
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Enable 2FA
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {isEnabled 
              ? "Manage your two-factor authentication settings"
              : "Add an extra layer of security to your account"
            }
          </DialogDescription>
        </DialogHeader>

        {isEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <ShieldCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">2FA is Active</p>
                <p className="text-sm text-green-600 dark:text-green-400">Your account is protected</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={disable2FA}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Disable Two-Factor Authentication
            </Button>
          </div>
        ) : (
          <>
            {step === "intro" && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <Smartphone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Authenticator App Required</p>
                      <p className="text-sm text-muted-foreground">
                        Use Google Authenticator, Authy, or similar
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={startSetup} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Get Started
                </Button>
              </div>
            )}

            {step === "qr" && qrCode && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app
                </div>

                {secret && (
                  <div className="space-y-2">
                    <Label>Or enter this code manually:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={secret} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copySecret}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <Button onClick={() => setStep("verify")} className="w-full">
                  Continue
                </Button>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter verification code</Label>
                  <Input
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("qr")} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={verifySetup} 
                    className="flex-1"
                    disabled={loading || verifyCode.length !== 6}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {step === "backup" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ Save these backup codes
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    You can use these if you lose access to your authenticator
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="text-center py-1">
                      {code}
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={copyBackupCodes} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Backup Codes
                </Button>

                <Button onClick={() => setOpen(false)} className="w-full">
                  Done
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
