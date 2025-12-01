/**
 * External Integrations Index
 * Re-exports all integration modules for easy importing
 */

// PropStream - Property data and comps
export {
  isPropStreamConfigured,
  getPropertyDetails,
  getComps,
  calculateARVFromComps,
  getARVEstimate,
  getMockARVEstimate,
  type PropStreamComp,
  type PropStreamPropertyData,
  type PropStreamARVResult,
  type PropStreamSearchParams,
} from "./propstream";

// DocuSign - E-signatures
export {
  isDocuSignConfigured,
  createEnvelope,
  getEnvelopeStatus,
  downloadSignedDocument,
  voidEnvelope,
  createOfferEnvelope,
  mapDocuSignStatusToDealStatus,
  getMockEnvelopeResponse,
  getMockEnvelopeStatus,
  type DocuSignRecipient,
  type DocuSignDocument,
  type DocuSignEnvelopeRequest,
  type DocuSignEnvelopeResponse,
  type DocuSignEnvelopeStatus,
} from "./docusign";

// Google Maps - Geocoding and drive times
export {
  isGoogleMapsConfigured,
  geocodeAddress,
  validateAddress,
  calculateDriveTime,
  calculateInvestorDriveTimes,
  getStaticMapUrl,
  getDirectionsUrl,
  getMockGeocodingResult,
  getMockDriveTimeResult,
  type GeocodingResult,
  type DriveTimeResult,
} from "./google-maps";

// Re-import for use in getIntegrationStatus
import { isPropStreamConfigured } from "./propstream";
import { isDocuSignConfigured } from "./docusign";
import { isGoogleMapsConfigured } from "./google-maps";

/**
 * Check which integrations are configured
 */
export function getIntegrationStatus(): {
  propstream: boolean;
  docusign: boolean;
  googleMaps: boolean;
  twilio: boolean;
  email: boolean;
} {
  return {
    propstream: isPropStreamConfigured(),
    docusign: isDocuSignConfigured(),
    googleMaps: isGoogleMapsConfigured(),
    twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    email: !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY),
  };
}
