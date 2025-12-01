import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: "#2563EB",
    paddingBottom: 20,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: "#2563EB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginLeft: 8,
  },
  documentTitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "right",
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    textAlign: "right",
  },
  offerBanner: {
    backgroundColor: "#2563EB",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  offerLabel: {
    fontSize: 12,
    color: "#BFDBFE",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  offerAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: "#64748B",
    width: 140,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 11,
    color: "#1E293B",
    flex: 1,
    fontWeight: "medium",
  },
  twoColumn: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  calculationBox: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    borderBottomStyle: "dashed",
  },
  calculationRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#2563EB",
  },
  calculationLabel: {
    fontSize: 10,
    color: "#64748B",
  },
  calculationValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "medium",
  },
  calculationTotal: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "bold",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  photo: {
    width: 120,
    height: 90,
    objectFit: "cover",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 9,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 8,
    color: "#94A3B8",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  badge: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  notesBox: {
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    marginTop: 8,
  },
  notesText: {
    fontSize: 10,
    color: "#92400E",
    lineHeight: 1.5,
  },
});

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Property type labels
const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

// Repair scope labels
const repairScopeLabels: Record<string, string> = {
  cosmetic: "Cosmetic - Minor repairs",
  moderate: "Moderate - Standard rehab",
  extensive: "Extensive - Major repairs",
  gut: "Gut Rehab - Full renovation",
};

export interface OfferPdfData {
  // Deal info
  dealId: string;
  submittedDate: string;
  status: string;
  
  // Property info
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    county?: string;
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    yearBuilt?: number;
  };
  
  // Seller info
  seller: {
    name: string;
    phone?: string;
    email?: string;
    motivation?: string;
  };
  
  // Financial info
  askingPrice: number;
  
  // Underwriting info
  underwriting?: {
    arv: number;
    repairEstimate: number;
    maxOffer: number;
    recommendedOffer?: number;
    profitEstimate?: number;
    repairScope?: string;
    notes?: string;
    holdingCosts?: number;
    closingCosts?: number;
  };
  
  // Photos
  photos?: string[];
  
  // Company info
  companyName?: string;
  preparedBy?: string;
}

export function OfferPdfTemplate({ data }: { data: OfferPdfData }) {
  const offerPrice = data.underwriting?.recommendedOffer || data.underwriting?.maxOffer || 0;
  const hasUnderwriting = !!data.underwriting;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>D</Text>
            </View>
            <Text style={styles.companyName}>{data.companyName || "DealFlow"}</Text>
          </View>
          <View>
            <Text style={styles.documentTitle}>PURCHASE OFFER</Text>
            <Text style={styles.dateText}>Generated: {formatDate(new Date())}</Text>
            {data.preparedBy && (
              <Text style={styles.dateText}>Prepared by: {data.preparedBy}</Text>
            )}
          </View>
        </View>

        {/* Offer Banner */}
        {hasUnderwriting && (
          <View style={styles.offerBanner}>
            <Text style={styles.offerLabel}>Maximum Allowable Offer</Text>
            <Text style={styles.offerAmount}>{formatCurrency(offerPrice)}</Text>
          </View>
        )}

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Property Details */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{data.property.address}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>City, State</Text>
                <Text style={styles.value}>
                  {data.property.city}, {data.property.state} {data.property.zip}
                </Text>
              </View>
              {data.property.county && (
                <View style={styles.row}>
                  <Text style={styles.label}>County</Text>
                  <Text style={styles.value}>{data.property.county}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Property Type</Text>
                <Text style={styles.value}>
                  {propertyTypeLabels[data.property.propertyType] || data.property.propertyType}
                </Text>
              </View>
              {(data.property.bedrooms || data.property.bathrooms) && (
                <View style={styles.row}>
                  <Text style={styles.label}>Bed/Bath</Text>
                  <Text style={styles.value}>
                    {data.property.bedrooms || "—"} bed / {data.property.bathrooms || "—"} bath
                  </Text>
                </View>
              )}
              {data.property.sqft && (
                <View style={styles.row}>
                  <Text style={styles.label}>Square Feet</Text>
                  <Text style={styles.value}>{data.property.sqft.toLocaleString()} sq ft</Text>
                </View>
              )}
              {data.property.yearBuilt && (
                <View style={styles.row}>
                  <Text style={styles.label}>Year Built</Text>
                  <Text style={styles.value}>{data.property.yearBuilt}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Seller & Deal Info */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seller Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{data.seller.name}</Text>
              </View>
              {data.seller.phone && (
                <View style={styles.row}>
                  <Text style={styles.label}>Phone</Text>
                  <Text style={styles.value}>{data.seller.phone}</Text>
                </View>
              )}
              {data.seller.email && (
                <View style={styles.row}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{data.seller.email}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Asking Price</Text>
                <Text style={styles.value}>{formatCurrency(data.askingPrice)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Underwriting Analysis */}
        {hasUnderwriting && data.underwriting && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Underwriting Analysis</Text>
            <View style={styles.calculationBox}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>After Repair Value (ARV)</Text>
                <Text style={styles.calculationValue}>{formatCurrency(data.underwriting.arv)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Less: Repair Costs</Text>
                <Text style={styles.calculationValue}>
                  ({formatCurrency(data.underwriting.repairEstimate)})
                </Text>
              </View>
              {data.underwriting.holdingCosts && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Less: Holding Costs</Text>
                  <Text style={styles.calculationValue}>
                    ({formatCurrency(data.underwriting.holdingCosts)})
                  </Text>
                </View>
              )}
              {data.underwriting.closingCosts && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Less: Closing Costs</Text>
                  <Text style={styles.calculationValue}>
                    ({formatCurrency(data.underwriting.closingCosts)})
                  </Text>
                </View>
              )}
              {data.underwriting.profitEstimate && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Less: Target Profit</Text>
                  <Text style={styles.calculationValue}>
                    ({formatCurrency(data.underwriting.profitEstimate)})
                  </Text>
                </View>
              )}
              <View style={styles.calculationRowLast}>
                <Text style={styles.calculationTotal}>Maximum Offer</Text>
                <Text style={styles.calculationTotal}>
                  {formatCurrency(data.underwriting.maxOffer)}
                </Text>
              </View>
            </View>
            
            {/* Repair Scope */}
            {data.underwriting.repairScope && (
              <View style={{ marginTop: 12 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>Repair Scope</Text>
                  <Text style={styles.value}>
                    {repairScopeLabels[data.underwriting.repairScope] || data.underwriting.repairScope}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Notes */}
            {data.underwriting.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{data.underwriting.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Deal Metrics */}
        {hasUnderwriting && data.underwriting && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deal Metrics</Text>
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Spread from Ask</Text>
                  <Text style={styles.value}>
                    {formatCurrency(data.askingPrice - data.underwriting.maxOffer)} (
                    {Math.round(((data.askingPrice - data.underwriting.maxOffer) / data.askingPrice) * 100)}%)
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>% of ARV</Text>
                  <Text style={styles.value}>
                    {Math.round((data.underwriting.maxOffer / data.underwriting.arv) * 100)}%
                  </Text>
                </View>
              </View>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Repair % of ARV</Text>
                  <Text style={styles.value}>
                    {Math.round((data.underwriting.repairEstimate / data.underwriting.arv) * 100)}%
                  </Text>
                </View>
                {data.underwriting.profitEstimate && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Est. Profit</Text>
                    <Text style={styles.value}>
                      {formatCurrency(data.underwriting.profitEstimate)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.companyName || "DealFlow"} | Real Estate Investment Platform
          </Text>
          <Text style={styles.footerText}>
            Deal ID: {data.dealId.slice(0, 8).toUpperCase()} | Submitted: {formatDate(data.submittedDate)}
          </Text>
          <Text style={styles.disclaimer}>
            This offer is for internal analysis purposes only and does not constitute a binding agreement.
            All calculations are estimates and should be verified before making any investment decisions.
          </Text>
        </View>
      </Page>

      {/* Photos Page (if photos exist) */}
      {data.photos && data.photos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>D</Text>
              </View>
              <Text style={styles.companyName}>{data.companyName || "DealFlow"}</Text>
            </View>
            <View>
              <Text style={styles.documentTitle}>PROPERTY PHOTOS</Text>
              <Text style={styles.dateText}>{data.property.address}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Photos ({data.photos.length})</Text>
            <View style={styles.photoGrid}>
              {data.photos.slice(0, 8).map((photoUrl, index) => (
                <Image key={index} src={photoUrl} style={styles.photo} />
              ))}
            </View>
            {data.photos.length > 8 && (
              <Text style={{ fontSize: 10, color: "#64748B", marginTop: 12 }}>
                + {data.photos.length - 8} additional photos available
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {data.companyName || "DealFlow"} | Property Photos
            </Text>
            <Text style={styles.footerText}>
              Deal ID: {data.dealId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
