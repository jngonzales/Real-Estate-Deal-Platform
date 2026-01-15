'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

// Start progress on navigation
if (typeof window !== 'undefined') {
  // Listen for click events on links
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor && anchor.href && !anchor.target && !anchor.download) {
      const url = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);
      
      // Only trigger for internal navigation
      if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
        NProgress.start();
      }
    }
  });
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}