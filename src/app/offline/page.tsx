export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're Offline</h1>
          <p className="text-muted-foreground">
            It looks like you've lost your internet connection. Some features may be unavailable.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
          <h2 className="font-semibold text-sm">While offline you can:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• View previously loaded deals</li>
            <li>• Access cached pages</li>
            <li>• Draft new deal submissions (saved locally)</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>

        <p className="text-xs text-muted-foreground">
          Your connection will be automatically restored when you're back online
        </p>
      </div>
    </div>
  );
}
