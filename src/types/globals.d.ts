// Ambient declarations for browser APIs used by the app that aren't in the
// default lib.dom typings.

interface TurnstileWidget {
  /** Reset the widget so the visitor has to solve a fresh challenge. */
  reset: (widgetId?: string) => void;
  /** Remove the widget from the DOM. */
  remove: (widgetId?: string) => void;
  /** Re-render the widget (e.g. after a locale change). */
  render: (
    container: string | HTMLElement,
    options: Record<string, unknown>
  ) => string;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
interface Window {
  /**
   * Cloudflare Turnstile's implicit global. We only need the surface area our
   * app actually calls; everything else is `unknown`.
   */
  turnstile?: TurnstileWidget;
}

interface Navigator {
  /**
   * iOS Safari reports `true` when the page is being rendered as a
   * home-screen-installed PWA. Other browsers leave it `undefined`.
   */
  standalone?: boolean;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export {};
