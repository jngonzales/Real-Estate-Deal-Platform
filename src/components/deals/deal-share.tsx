'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Share2, 
  Copy, 
  Check, 
  Link, 
  Eye,
  ExternalLink,
} from '@/components/ui/icons';
import { format } from 'date-fns';

interface DealShareProps {
  dealId: string;
  shareToken?: string;
  shareEnabled?: boolean;
  shareExpiresAt?: string | null;
  shareViewCount?: number;
  onUpdate?: (data: { share_enabled: boolean; share_expires_at: string | null }) => void;
}

export function DealShare({
  dealId,
  shareToken,
  shareEnabled = false,
  shareExpiresAt,
  shareViewCount = 0,
  onUpdate,
}: DealShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(shareEnabled);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    shareExpiresAt ? new Date(shareExpiresAt) : undefined
  );
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const shareUrl = shareToken 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareToken}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleToggleShare = async (newEnabled: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/deals/${dealId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          share_enabled: newEnabled,
          share_expires_at: expiresAt?.toISOString() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update share settings');

      setEnabled(newEnabled);
      onUpdate?.({ 
        share_enabled: newEnabled, 
        share_expires_at: expiresAt?.toISOString() || null 
      });
      toast.success(newEnabled ? 'Share link enabled!' : 'Share link disabled');
    } catch {
      toast.error('Failed to update share settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExpirationChange = async (date: Date | undefined) => {
    setExpiresAt(date);
    
    if (enabled) {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/deals/${dealId}/share`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            share_enabled: enabled,
            share_expires_at: date?.toISOString() || null,
          }),
        });

        if (!response.ok) throw new Error('Failed to update expiration');

        onUpdate?.({ 
          share_enabled: enabled, 
          share_expires_at: date?.toISOString() || null 
        });
        toast.success(date ? 'Expiration date set!' : 'Expiration removed');
      } catch {
        toast.error('Failed to update expiration');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Share Deal
          </DialogTitle>
          <DialogDescription>
            Create a public link to share this deal analysis with anyone — no login required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Public Link</Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this deal
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggleShare}
              disabled={isUpdating}
            />
          </div>

          {/* Share URL */}
          {enabled && shareToken && (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Expiration Date */}
          {enabled && (
            <div className="space-y-2">
              <Label>Link Expiration (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={expiresAt ? format(expiresAt, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleExpirationChange(e.target.value ? new Date(e.target.value) : undefined)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="flex-1"
                />
                {expiresAt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExpirationChange(undefined)}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {expiresAt ? `Expires ${format(expiresAt, 'PPP')}` : 'Link never expires'}
              </p>
            </div>
          )}

          {/* View Count */}
          {enabled && shareViewCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Viewed {shareViewCount} times</span>
            </div>
          )}

          {/* Actions */}
          {enabled && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(shareUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
