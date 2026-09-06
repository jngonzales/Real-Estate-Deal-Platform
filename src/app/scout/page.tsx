'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PublicHeading, PublicPage, publicAction, publicField } from '@/components/layout/public-page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { VoiceRecorder } from '@/components/deals/voice-recorder';
import { HoneypotField, FormTimestamp, Turnstile, type TurnstileRef } from '@/components/security';

export default function ScoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileRef>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const timestampRef = useRef<HTMLInputElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    condition: '',
    notes: '',
    scoutName: '',
    scoutPhone: '',
    scoutEmail: '',
    photos: [] as string[],
    voiceNotes: [] as { id: string; text: string; timestamp: Date; duration: number; audioUrl: string; audioBlob: Blob }[],
  });

  const handleVoiceRecordingsChange = useCallback((recordings: { id: string; text: string; timestamp: Date; duration: number; audioUrl: string; audioBlob: Blob }[]) => {
    setFormData(prev => ({ ...prev, voiceNotes: recordings }));
  }, []);

  const handleVoiceTranscriptChange = useCallback((_fullTranscript: string) => {
    // Voice notes are kept separate from typed notes; the callback is wired up
    // so the recorder can still notify us if/when we decide to merge transcripts.
    // The argument is intentionally unused for now.
    void _fullTranscript;
  }, []);

  // Geolocation to auto-fill address
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get address from coordinates
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            
            // Build street address
            const houseNumber = address.house_number || '';
            const road = address.road || '';
            const streetAddress = `${houseNumber} ${road}`.trim() || data.display_name?.split(',')[0] || '';
            
            setFormData(prev => ({
              ...prev,
              propertyAddress: streetAddress,
              city: address.city || address.town || address.village || address.hamlet || '',
              state: address.state || '',
              zipCode: address.postcode || '',
            }));
            
            toast.success('Location found!', {
              description: 'Address fields have been filled automatically',
            });
          } else {
            toast.error('Could not get address from location');
          }
        } catch {
          toast.error('Failed to get address from location');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied', {
              description: 'Please enable location access in your browser settings',
            });
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location unavailable', {
              description: 'Your current location could not be determined',
            });
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out', {
              description: 'Please try again',
            });
            break;
          default:
            toast.error('Failed to get location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot - if filled, it's a bot
    if (honeypotRef.current?.value) {
      // Silently "succeed" to confuse bots
      setIsSubmitted(true);
      return;
    }
    
    if (!formData.propertyAddress || !formData.city || !formData.scoutName) {
      toast.error('Please fill in required fields');
      return;
    }
    
    // Check Turnstile token (if configured)
    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      toast.error('Please complete the security verification');
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform to snake_case for API
      const payload = {
        property_address: formData.propertyAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        property_type: formData.propertyType,
        condition: formData.condition,
        notes: formData.notes,
        photos: formData.photos,
        scout_name: formData.scoutName,
        scout_phone: formData.scoutPhone,
        scout_email: formData.scoutEmail,
        voice_notes: formData.voiceNotes.map(vn => vn.text).join('\n\n'),
        turnstile_token: turnstileToken,
        _form_started: timestampRef.current?.value,
      };
      
      const response = await fetch('/api/scout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit lead');
      }

      setIsSubmitted(true);
      toast.success('Lead submitted successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <PublicPage className="max-w-lg">
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <PublicHeading>Lead submitted</PublicHeading>
          <p className="mt-3 text-muted-foreground">We&apos;ll review it and contact you if we move forward.</p>
          <Button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                propertyAddress: '',
                city: '',
                state: '',
                zipCode: '',
                propertyType: '',
                condition: '',
                notes: '',
                scoutName: '',
                scoutPhone: '',
                scoutEmail: '',
                photos: [],
                voiceNotes: [],
              });
            }}
            className={publicAction + " mt-6"}
          >
            Submit another lead
          </Button>
        </section>
      </PublicPage>
    );
  }

  return (
    <PublicPage className="max-w-3xl">
      <PublicHeading>Submit a property lead</PublicHeading>
      <p className="mt-2 text-muted-foreground">Tell us about a property. Finder&apos;s fees are paid if the deal closes.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-lg border border-border bg-card p-4 sm:p-6">
        <section aria-labelledby="scout-property" className="space-y-4">
          <h2 id="scout-property" className="text-lg font-semibold">Property information</h2>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-x-2">
              <Label htmlFor="scout-address">Property address (required)</Label>
              <Button
                type="button"
                variant="ghost"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className={publicAction + " px-2"}
              >
                {isGettingLocation ? "Getting location…" : "Use GPS"}
              </Button>
              <span role="status" className="sr-only">{isGettingLocation && "Getting location…"}</span>
            </div>
            <Input
              id="scout-address"
              name="propertyAddress"
              autoComplete="section-property address-line1"
              value={formData.propertyAddress}
              onChange={(event) => setFormData(prev => ({ ...prev, propertyAddress: event.target.value }))}
              className={publicField}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="scout-city">City (required)</Label>
              <Input
                id="scout-city"
                name="city"
                autoComplete="section-property address-level2"
                value={formData.city}
                onChange={(event) => setFormData(prev => ({ ...prev, city: event.target.value }))}
                className={publicField}
                required
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="scout-state">State</Label>
              <Input
                id="scout-state"
                name="state"
                autoComplete="section-property address-level1"
                value={formData.state}
                onChange={(event) => setFormData(prev => ({ ...prev, state: event.target.value }))}
                className={publicField}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="scout-zip">ZIP code</Label>
              <Input
                id="scout-zip"
                name="zipCode"
                autoComplete="section-property postal-code"
                value={formData.zipCode}
                onChange={(event) => setFormData(prev => ({ ...prev, zipCode: event.target.value }))}
                className={publicField}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="scout-type">Property type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger id="scout-type" className={publicField + " w-full"}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_family">Single family</SelectItem>
                  <SelectItem value="multi_family">Multi family</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scout-condition">Property condition</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
            >
              <SelectTrigger id="scout-condition" className={publicField + " w-full"}>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair / needs work</SelectItem>
                <SelectItem value="poor">Poor / major rehab</SelectItem>
                <SelectItem value="distressed">Distressed / vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scout-notes">Notes</Label>
            <Textarea
              id="scout-notes"
              name="notes"
              value={formData.notes}
              onChange={(event) => setFormData(prev => ({ ...prev, notes: event.target.value }))}
              className={publicField + " min-h-24"}
              aria-describedby="scout-notes-hint"
            />
            <p id="scout-notes-hint" className="text-sm text-muted-foreground">
              Include any known repairs, occupancy, or owner details.
            </p>
          </div>

          <div role="group" aria-labelledby="scout-voice-notes" className="space-y-2 motion-reduce:[&_*]:animate-none">
            <p id="scout-voice-notes" className="text-sm font-medium">Voice notes</p>
            <VoiceRecorder
              onRecordingsChange={handleVoiceRecordingsChange}
              onTranscriptChange={handleVoiceTranscriptChange}
              maxRecordings={5}
            />
          </div>
          <p className="text-sm text-muted-foreground">Photo upload coming soon.</p>
        </section>

        <section aria-labelledby="scout-contact" className="space-y-4 border-t border-border pt-6">
          <h2 id="scout-contact" className="text-lg font-semibold">Contact information</h2>
          <div className="space-y-2">
            <Label htmlFor="scout-name">Your name (required)</Label>
            <Input
              id="scout-name"
              name="scoutName"
              autoComplete="name"
              value={formData.scoutName}
              onChange={(event) => setFormData(prev => ({ ...prev, scoutName: event.target.value }))}
              className={publicField}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="scout-phone">Phone number</Label>
              <Input
                id="scout-phone"
                name="scoutPhone"
                type="tel"
                autoComplete="tel"
                value={formData.scoutPhone}
                onChange={(event) => setFormData(prev => ({ ...prev, scoutPhone: event.target.value }))}
                className={publicField}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="scout-email">Email</Label>
              <Input
                id="scout-email"
                name="scoutEmail"
                type="email"
                autoComplete="email"
                value={formData.scoutEmail}
                onChange={(event) => setFormData(prev => ({ ...prev, scoutEmail: event.target.value }))}
                className={publicField}
              />
            </div>
          </div>
        </section>

        <div className="space-y-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            By submitting, you agree that this is a legitimate lead and you have not submitted it elsewhere.
          </p>
          <HoneypotField ref={honeypotRef} />
          <FormTimestamp ref={timestampRef} />
          <div className="flex justify-center [&>div]:shrink-0">
            <Turnstile
              ref={turnstileRef}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>
          <div role="status" className="sr-only">{isSubmitting && "Submitting lead…"}</div>
          <Button type="submit" disabled={isSubmitting} className={publicAction + " w-full sm:w-auto"}>
            {isSubmitting ? "Submitting lead…" : "Submit lead"}
          </Button>
        </div>
      </form>
    </PublicPage>
  );
}
