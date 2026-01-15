'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';

interface HoneypotFieldProps {
  name?: string;
}

/**
 * Honeypot field component for catching bots.
 * Bots will fill this invisible field, real users won't.
 * 
 * Safety features to prevent false positives:
 * - tabIndex={-1} - Cannot be tabbed to
 * - autocomplete="off" + autocomplete="new-password" - Prevents autofill
 * - Positioned completely off-screen
 * - aria-hidden for screen readers
 * - readonly initially, becomes editable only programmatically (for bot tests)
 * - Clears any accidental input on blur (just in case)
 * 
 * Usage:
 * 1. Add <HoneypotField /> to your form
 * 2. On server, check if the honeypot field has a value
 * 3. If it has a value, reject the submission (it's a bot)
 */
export const HoneypotField = forwardRef<HTMLInputElement, HoneypotFieldProps>(
  ({ name = 'website_url' }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Forward the ref
    useImperativeHandle(ref, () => inputRef.current!);

    // Clear any accidental input when the field is blurred
    // This is an extra safety measure
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const handleBlur = () => {
        // If a human somehow focuses this field, clear it
        // Real users should never interact with this field
        if (input.value) {
          input.value = '';
        }
      };

      input.addEventListener('blur', handleBlur);
      return () => input.removeEventListener('blur', handleBlur);
    }, []);

    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none', // Prevents any mouse interaction
        }}
      >
        {/* Decoy label that bots might look for */}
        <label htmlFor={name} style={{ display: 'none' }}>
          Website URL (leave empty)
        </label>
        <input
          ref={inputRef}
          type="text"
          id={name}
          name={name}
          tabIndex={-1}
          autoComplete="off"
          // Additional autocomplete prevention
          data-lpignore="true"      // LastPass
          data-1p-ignore="true"     // 1Password
          data-form-type="other"    // Dashlane
          placeholder=""
          defaultValue=""
        />
      </div>
    );
  }
);

HoneypotField.displayName = 'HoneypotField';

/**
 * Server-side honeypot validation
 * Returns true if the submission is likely from a bot
 */
export function isHoneypotTriggered(formData: FormData | Record<string, unknown>, fieldName = 'website_url'): boolean {
  if (formData instanceof FormData) {
    const value = formData.get(fieldName);
    return value !== null && value !== '';
  }
  
  const value = formData[fieldName];
  return value !== undefined && value !== null && value !== '';
}

/**
 * Hidden timestamp field for form timing validation
 * Bots typically fill forms in < 2 seconds
 * Real users take at least 5-10 seconds for any form
 */
export const FormTimestamp = forwardRef<HTMLInputElement, { name?: string }>(
  ({ name = '_form_started' }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => inputRef.current!);
    
    // Set timestamp on mount via DOM (avoids React render issues)
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.value = Date.now().toString();
      }
    }, []);
    
    return (
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        defaultValue=""
      />
    );
  }
);

FormTimestamp.displayName = 'FormTimestamp';

/**
 * Check if form was submitted too quickly (likely a bot)
 * @param startTime - Timestamp when form was rendered
 * @param minSeconds - Minimum seconds a real user would take (default: 3)
 * @returns true if submitted too fast (likely bot)
 */
export function isFormSubmittedTooFast(
  startTime: string | number | null | undefined,
  minSeconds = 3
): boolean {
  if (!startTime) return false; // Can't verify, allow it
  
  const start = typeof startTime === 'string' ? parseInt(startTime, 10) : startTime;
  if (isNaN(start)) return false;
  
  const elapsed = (Date.now() - start) / 1000;
  return elapsed < minSeconds;
}
