'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { VoiceRecorder } from '@/components/deals/voice-recorder';
import { HoneypotField, FormTimestamp } from '@/components/security';
import { Turnstile, TurnstileRef } from '@/components/security';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Camera, 
  Send, 
  CheckCircle,
  AlertCircle,
  Home,
  Navigation,
  Loader2
} from 'lucide-react';

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
    // Optionally auto-append to notes
    // We'll keep voice notes separate but could merge them
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-secondary/50 border-border">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your lead has been submitted successfully. We&apos;ll review it and get back to you if we move forward.
            </p>
            <Button
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
              className="bg-primary hover:bg-primary/90"
            >
              Submit Another Lead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">DealFlow Scout</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Submit a property lead and earn a finder&apos;s fee if we close the deal!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-secondary/50 border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Home className="h-5 w-5 text-emerald-500" />
                Property Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us about the property you found
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-foreground/90">Property Address *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-secondary/80/50 h-7 px-2 gap-1"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Getting location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3.5 w-3.5" />
                        Use GPS
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="123 Main Street"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
                    className="pl-10 bg-muted/40 border-border text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/90">City *</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 bg-muted/40 border-border text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-foreground/90">State</Label>
                  <Input
                    placeholder="TX"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 bg-muted/40 border-border text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/90">ZIP Code</Label>
                  <Input
                    placeholder="75001"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="mt-1 bg-muted/40 border-border text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground/90">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-muted/40 border-border text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      <SelectItem value="single_family">Single Family</SelectItem>
                      <SelectItem value="multi_family">Multi Family</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-foreground/90">Property Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger className="mt-1 bg-muted/40 border-border text-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-border">
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair / Needs Work</SelectItem>
                    <SelectItem value="poor">Poor / Major Rehab</SelectItem>
                    <SelectItem value="distressed">Distressed / Vacant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground/90 mb-2 block">Notes / Details</Label>
                <Textarea
                  placeholder="Tell us about the property: Why do you think it's a deal? Is it vacant? Owner situation? Any repairs needed?"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px] bg-muted/40 border-border text-white"
                />
              </div>

              <div>
                <Label className="text-foreground/90 mb-2 block">Voice Notes</Label>
                <VoiceRecorder
                  onRecordingsChange={handleVoiceRecordingsChange}
                  onTranscriptChange={handleVoiceTranscriptChange}
                  maxRecordings={5}
                />
              </div>

              <div>
                <Label className="text-foreground/90 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photos (Coming Soon)
                </Label>
                <div className="mt-1 border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Photo upload coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50 border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-emerald-500" />
                Your Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                So we can reach you about the finder&apos;s fee
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground/90">Your Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    value={formData.scoutName}
                    onChange={(e) => setFormData(prev => ({ ...prev, scoutName: e.target.value }))}
                    className="pl-10 bg-muted/40 border-border text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/90">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.scoutPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, scoutPhone: e.target.value }))}
                      className="pl-10 bg-muted/40 border-border text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground/90">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={formData.scoutEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, scoutEmail: e.target.value }))}
                    className="mt-1 bg-muted/40 border-border text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">
              By submitting, you agree that this is a legitimate lead and you have not submitted it elsewhere. 
              Finder&apos;s fees are paid upon successful closing.
            </p>
          </div>

          {/* Honeypot for bot detection */}
          <HoneypotField ref={honeypotRef} />
          
          {/* Form timestamp for timing validation */}
          <FormTimestamp ref={timestampRef} />
          
          {/* Cloudflare Turnstile CAPTCHA */}
          <div className="mb-6 flex justify-center">
            <Turnstile 
              ref={turnstileRef}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Lead
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Powered by DealFlow • Questions? Contact us
        </p>
      </div>
    </div>
  );
}