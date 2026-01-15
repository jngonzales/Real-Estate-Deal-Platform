'use client';

import { Turnstile as CloudflareTurnstile } from '@marsidev/react-turnstile';
import { useState, forwardRef, useImperativeHandle } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

export interface TurnstileRef {
  reset: () => void;
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({ onVerify, onExpire, onError, className }, ref) => {
    const [widgetId, setWidgetId] = useState<string | null>(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetId && typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).turnstile?.reset(widgetId);
        }
      },
    }));

    // If no site key, don't render (allows running without Turnstile configured)
    if (!siteKey) {
      // In development/without Turnstile, auto-verify
      if (typeof window !== 'undefined') {
        setTimeout(() => onVerify('dev-mode-token'), 100);
      }
      return null;
    }

    return (
      <div className={className}>
        <CloudflareTurnstile
          siteKey={siteKey}
          onSuccess={(token) => {
            onVerify(token);
          }}
          onExpire={() => {
            onExpire?.();
          }}
          onError={() => {
            onError?.();
          }}
          options={{
            theme: 'dark',
            size: 'normal',
          }}
          onWidgetLoad={(id) => setWidgetId(id)}
        />
      </div>
    );
  }
);

Turnstile.displayName = 'Turnstile';

// Server-side verification function
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  // If no secret key configured, allow in development
  if (!secretKey) {
    console.warn('[Turnstile] No secret key configured, skipping verification');
    return true;
  }
  
  // Accept dev-mode tokens in development
  if (token === 'dev-mode-token' && process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return false;
  }
}
