/**
 * DocuSign Integration
 * E-signature functionality for offer documents
 * 
 * Note: DocuSign requires API credentials and OAuth setup.
 * Set the following in .env.local:
 * - DOCUSIGN_INTEGRATION_KEY
 * - DOCUSIGN_SECRET_KEY
 * - DOCUSIGN_ACCOUNT_ID
 * - DOCUSIGN_BASE_URL (use demo for testing)
 * 
 * API Docs: https://developers.docusign.com/docs/esign-rest-api/
 */

export interface DocuSignRecipient {
  email: string;
  name: string;
  recipientId: string;
  routingOrder?: number;
  tabs?: DocuSignTab[];
}

export interface DocuSignTab {
  anchorString?: string;
  anchorXOffset?: string;
  anchorYOffset?: string;
  tabLabel: string;
  xPosition?: string;
  yPosition?: string;
  pageNumber?: string;
  documentId?: string;
}

export interface DocuSignDocument {
  documentBase64: string;
  documentId: string;
  fileExtension: string;
  name: string;
}

export interface DocuSignEnvelopeRequest {
  emailSubject: string;
  emailBody?: string;
  documents: DocuSignDocument[];
  recipients: {
    signers: DocuSignRecipient[];
    carbonCopies?: DocuSignRecipient[];
  };
  status: "sent" | "created"; // "sent" sends immediately, "created" saves as draft
}

export interface DocuSignEnvelopeResponse {
  envelopeId: string;
  status: string;
  statusDateTime: string;
  uri: string;
}

export interface DocuSignEnvelopeStatus {
  envelopeId: string;
  status: "sent" | "delivered" | "signed" | "completed" | "declined" | "voided";
  statusDateTime: string;
  sentDateTime?: string;
  deliveredDateTime?: string;
  signedDateTime?: string;
  completedDateTime?: string;
  recipients?: {
    signers: {
      email: string;
      name: string;
      status: string;
      signedDateTime?: string;
    }[];
  };
}

// DocuSign environments
const DOCUSIGN_DEMO_URL = "https://demo.docusign.net/restapi";
// Production URL varies by account region: na3, na4, eu, au
// const DOCUSIGN_PROD_URL = "https://na3.docusign.net/restapi";

/**
 * Get DocuSign configuration from environment
 */
function getDocuSignConfig() {
  return {
    integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || null,
    secretKey: process.env.DOCUSIGN_SECRET_KEY || null,
    accountId: process.env.DOCUSIGN_ACCOUNT_ID || null,
    baseUrl: process.env.DOCUSIGN_BASE_URL || DOCUSIGN_DEMO_URL,
    accessToken: process.env.DOCUSIGN_ACCESS_TOKEN || null, // For JWT auth
  };
}

/**
 * Check if DocuSign is configured
 */
export function isDocuSignConfigured(): boolean {
  const config = getDocuSignConfig();
  return !!(config.integrationKey && config.accountId && config.accessToken);
}

/**
 * Make authenticated request to DocuSign API
 */
async function docuSignRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: unknown
): Promise<{ data: T | null; error: string | null }> {
  const config = getDocuSignConfig();
  
  if (!config.accessToken || !config.accountId) {
    return { data: null, error: "DocuSign not configured" };
  }

  try {
    const url = `${config.baseUrl}/v2.1/accounts/${config.accountId}${endpoint}`;
    
    const headers: HeadersInit = {
      "Authorization": `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DocuSign API error:", errorText);
      return { data: null, error: `DocuSign API error: ${response.status}` };
    }

    const data = await response.json();
    return { data: data as T, error: null };
  } catch (error) {
    console.error("DocuSign request failed:", error);
    return { data: null, error: "Failed to connect to DocuSign API" };
  }
}

/**
 * Create and send an envelope (document for signature)
 */
export async function createEnvelope(
  request: DocuSignEnvelopeRequest
): Promise<{ data: DocuSignEnvelopeResponse | null; error: string | null }> {
  return docuSignRequest<DocuSignEnvelopeResponse>("POST", "/envelopes", request);
}

/**
 * Get envelope status
 */
export async function getEnvelopeStatus(
  envelopeId: string
): Promise<{ data: DocuSignEnvelopeStatus | null; error: string | null }> {
  return docuSignRequest<DocuSignEnvelopeStatus>("GET", `/envelopes/${envelopeId}`);
}

/**
 * Download signed document
 */
export async function downloadSignedDocument(
  envelopeId: string,
  documentId: string = "combined"
): Promise<{ data: Blob | null; error: string | null }> {
  const config = getDocuSignConfig();
  
  if (!config.accessToken || !config.accountId) {
    return { data: null, error: "DocuSign not configured" };
  }

  try {
    const url = `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes/${envelopeId}/documents/${documentId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
      },
    });

    if (!response.ok) {
      return { data: null, error: `DocuSign API error: ${response.status}` };
    }

    const blob = await response.blob();
    return { data: blob, error: null };
  } catch (error) {
    console.error("DocuSign download failed:", error);
    return { data: null, error: "Failed to download signed document" };
  }
}

/**
 * Void an envelope (cancel signature request)
 */
export async function voidEnvelope(
  envelopeId: string,
  voidedReason: string
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await docuSignRequest<{ envelopeId: string }>(
    "PUT",
    `/envelopes/${envelopeId}`,
    { status: "voided", voidedReason }
  );

  if (error || !data) {
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Create a real estate offer envelope
 * Helper function that creates a properly formatted offer document
 */
export async function createOfferEnvelope(params: {
  dealNumber: string;
  propertyAddress: string;
  offerPrice: number;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  pdfDocument: string; // Base64 encoded PDF
  ccEmails?: { name: string; email: string }[];
}): Promise<{ data: DocuSignEnvelopeResponse | null; error: string | null }> {
  const { dealNumber, propertyAddress, offerPrice, sellerName, sellerEmail, buyerName, buyerEmail, pdfDocument, ccEmails } = params;

  // Create signature tabs for seller
  const sellerTabs: DocuSignTab[] = [
    {
      anchorString: "/sn1/",
      anchorXOffset: "0",
      anchorYOffset: "0",
      tabLabel: "Seller Signature",
    },
    {
      anchorString: "/dt1/",
      anchorXOffset: "0",
      anchorYOffset: "0",
      tabLabel: "Date Signed",
    },
  ];

  // Create signature tabs for buyer
  const buyerTabs: DocuSignTab[] = [
    {
      anchorString: "/sn2/",
      anchorXOffset: "0",
      anchorYOffset: "0",
      tabLabel: "Buyer Signature",
    },
    {
      anchorString: "/dt2/",
      anchorXOffset: "0",
      anchorYOffset: "0",
      tabLabel: "Date Signed",
    },
  ];

  const envelope: DocuSignEnvelopeRequest = {
    emailSubject: `${dealNumber}: Purchase Offer for ${propertyAddress}`,
    emailBody: `Please review and sign the attached purchase offer for ${propertyAddress}. Offer Amount: $${offerPrice.toLocaleString()}`,
    documents: [
      {
        documentBase64: pdfDocument,
        documentId: "1",
        fileExtension: "pdf",
        name: `${dealNumber}-Offer.pdf`,
      },
    ],
    recipients: {
      signers: [
        {
          email: sellerEmail,
          name: sellerName,
          recipientId: "1",
          routingOrder: 1,
          tabs: sellerTabs,
        },
        {
          email: buyerEmail,
          name: buyerName,
          recipientId: "2",
          routingOrder: 2,
          tabs: buyerTabs,
        },
      ],
      carbonCopies: ccEmails?.map((cc, index) => ({
        email: cc.email,
        name: cc.name,
        recipientId: String(index + 10),
        routingOrder: 3,
      })),
    },
    status: "sent",
  };

  return createEnvelope(envelope);
}

/**
 * Map DocuSign status to our deal status
 */
export function mapDocuSignStatusToDealStatus(
  docuSignStatus: string
): "offer_sent" | "in_contract" | "rejected" | null {
  switch (docuSignStatus) {
    case "sent":
    case "delivered":
      return "offer_sent";
    case "completed":
    case "signed":
      return "in_contract";
    case "declined":
    case "voided":
      return "rejected";
    default:
      return null;
  }
}

/**
 * Mock DocuSign response for development/testing
 */
export function getMockEnvelopeResponse(dealNumber: string): DocuSignEnvelopeResponse {
  return {
    envelopeId: `mock-${dealNumber}-${Date.now()}`,
    status: "sent",
    statusDateTime: new Date().toISOString(),
    uri: `/envelopes/mock-${dealNumber}`,
  };
}

/**
 * Get mock envelope status for development/testing
 */
export function getMockEnvelopeStatus(envelopeId: string): DocuSignEnvelopeStatus {
  return {
    envelopeId,
    status: "sent",
    statusDateTime: new Date().toISOString(),
    sentDateTime: new Date().toISOString(),
    recipients: {
      signers: [
        {
          email: "seller@example.com",
          name: "Test Seller",
          status: "sent",
        },
        {
          email: "buyer@example.com",
          name: "Test Buyer",
          status: "created",
        },
      ],
    },
  };
}
