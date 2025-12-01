/**
 * Deal Number Generator
 * Generates human-readable deal numbers like "DEALFLOW-001"
 */

const DEAL_PREFIX = "DEALFLOW";

/**
 * Format a numeric ID into a padded deal number
 * @param id - The numeric sequence ID (from database serial)
 * @returns Formatted deal number like "DEALFLOW-001"
 */
export function formatDealNumber(id: number): string {
  const paddedNumber = id.toString().padStart(3, "0");
  return `${DEAL_PREFIX}-${paddedNumber}`;
}

/**
 * Parse a deal number back to its numeric ID
 * @param dealNumber - The formatted deal number like "DEALFLOW-001"
 * @returns The numeric ID or null if invalid
 */
export function parseDealNumber(dealNumber: string): number | null {
  const regex = new RegExp(`^${DEAL_PREFIX}-(\\d+)$`);
  const match = dealNumber.match(regex);
  
  if (!match) {
    return null;
  }
  
  return parseInt(match[1], 10);
}

/**
 * Validate if a string is a valid deal number format
 * @param dealNumber - The string to validate
 * @returns True if valid deal number format
 */
export function isValidDealNumber(dealNumber: string): boolean {
  return parseDealNumber(dealNumber) !== null;
}

/**
 * Generate the next deal number based on the current max
 * @param currentMax - The current maximum deal number ID
 * @returns The next formatted deal number
 */
export function generateNextDealNumber(currentMax: number): string {
  return formatDealNumber(currentMax + 1);
}
