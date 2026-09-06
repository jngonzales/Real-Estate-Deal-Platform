"use client";

import { ExternalLink } from "@/components/ui/icons";

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
    <section aria-labelledby="integrations-title" className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4 sm:px-6">
        <h2 id="integrations-title" className="text-lg font-semibold">Integrations</h2>
        <span className="text-sm tabular-nums text-muted-foreground">{configuredCount} of {totalCount} configured</span>
      </div>
      <ul className="divide-y divide-border border-t border-border">
        {integrations.map((integration) => {
          const isConfigured = status[integration.key];
          return (
            <li key={integration.key} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 p-4 sm:px-6">
              <div className="min-w-0 flex-1 basis-40 [overflow-wrap:anywhere]">
                <h3 className="font-medium">{integration.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{integration.description}</p>
                <p className="mt-1 text-sm">
                  {isConfigured ? "Configured" : "Setup required"}
                  {!isConfigured && <span className="text-muted-foreground"> · {integration.envVars[0]}</span>}
                </p>
              </div>
              <a
                href={integration.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={"Setup guide for " + integration.name}
                className="inline-flex min-h-11 items-center gap-1 text-sm text-primary underline underline-offset-4"
              >
                Setup guide
                <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
