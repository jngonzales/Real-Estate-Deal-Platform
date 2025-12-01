"use client";

import { Check, X, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface IntegrationStatus {
  propstream: boolean;
  docusign: boolean;
  googleMaps: boolean;
  twilio: boolean;
  email: boolean;
}

interface IntegrationsStatusProps {
  status: IntegrationStatus;
}

const integrations = [
  {
    key: "email" as const,
    name: "Email (Resend/SendGrid)",
    description: "Send email notifications to users",
    envVars: ["RESEND_API_KEY or SENDGRID_API_KEY"],
    docsUrl: "https://resend.com/docs",
  },
  {
    key: "twilio" as const,
    name: "SMS (Twilio)",
    description: "Send SMS notifications to agents",
    envVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    docsUrl: "https://www.twilio.com/docs/sms",
  },
  {
    key: "propstream" as const,
    name: "PropStream",
    description: "Fetch property comps for ARV calculations",
    envVars: ["PROPSTREAM_API_KEY"],
    docsUrl: "https://www.propstream.com/api",
  },
  {
    key: "docusign" as const,
    name: "DocuSign",
    description: "Send offers for e-signature",
    envVars: ["DOCUSIGN_INTEGRATION_KEY", "DOCUSIGN_ACCOUNT_ID", "DOCUSIGN_ACCESS_TOKEN"],
    docsUrl: "https://developers.docusign.com/",
  },
  {
    key: "googleMaps" as const,
    name: "Google Maps",
    description: "Address validation & drive time calculations",
    envVars: ["GOOGLE_MAPS_API_KEY"],
    docsUrl: "https://console.cloud.google.com/",
  },
];

export function IntegrationsStatus({ status }: IntegrationsStatusProps) {
  const configuredCount = Object.values(status).filter(Boolean).length;
  const totalCount = Object.keys(status).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Integrations</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {configuredCount}/{totalCount} configured
          </span>
        </div>
        <CardDescription>External services connected to the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => {
          const isConfigured = status[integration.key];
          return (
            <div
              key={integration.key}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                isConfigured
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {isConfigured ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isConfigured && (
                  <span className="text-xs text-muted-foreground">
                    Set: {integration.envVars[0]}
                  </span>
                )}
                <a
                  href={integration.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> Integrations without API keys will use mock/demo data for testing purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
