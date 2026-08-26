import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Types for the deal report
interface DealReportData {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt?: number;
  };
  financials: {
    askingPrice: number;
    arv: number;
    repairCost: number;
    closingCostsBuy: number;
    holdingCosts: number;
    sellingCosts: number;
    totalInvestment: number;
    profit: number;
    roi: number;
    mao70: number;
    mao75?: number;
    mao65?: number;
  };
  repairs?: {
    category: string;
    description?: string;
    cost: number;
  }[];
  financing?: {
    loanType: string;
    loanAmount: number;
    interestRate: number;
    loanTerm: number;
    downPayment: number;
    monthlyPayment?: number;
  };
  seller?: {
    name: string;
    phone?: string;
    email?: string;
    motivation?: string;
  };
  agent?: {
    name: string;
    email?: string;
  };
  notes?: string;
  generatedAt: string;
  dealScore: "Great" | "Good" | "Marginal" | "Pass";
}

// Color palette
const colors = {
  primary: "#22A06B",
  primaryLight: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  dark: "#1E293B",
  gray: "#64748B",
  lightGray: "#E2E8F0",
  white: "#FFFFFF",
  background: "#F8FAFC",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: "Helvetica",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginLeft: 8,
  },
  reportTitle: {
    fontSize: 12,
    color: colors.gray,
    textAlign: "right",
  },
  dateText: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 4,
    textAlign: "right",
  },
  // Property Address Banner
  addressBanner: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  propertyAddress: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  propertyLocation: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  propertyDetails: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 6,
  },
  // Score Card
  scoreCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  scoreCardGreat: {
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: colors.success,
  },
  scoreCardGood: {
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scoreCardMarginal: {
    backgroundColor: "#FFFBEB",
    borderWidth: 2,
    borderColor: colors.warning,
  },
  scoreCardPass: {
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: colors.danger,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreTextGreat: { color: colors.success },
  scoreTextGood: { color: colors.primary },
  scoreTextMarginal: { color: colors.warning },
  scoreTextPass: { color: colors.danger },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Grid layout
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
  },
  gridCol: {
    flex: 1,
  },
  // Data rows
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  dataLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  dataValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.dark,
  },
  dataValueSuccess: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.success,
  },
  dataValueDanger: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.danger,
  },
  // Highlight box
  highlightBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.dark,
  },
  highlightValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
  },
  // Table
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.background,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.dark,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tableCell: {
    fontSize: 9,
    color: colors.dark,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
  },
  // Notes
  notesBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  notesText: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.5,
  },
});

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper to get property type label
function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    single_family: "Single Family",
    multi_family: "Multi-Family",
    condo: "Condo",
    townhouse: "Townhouse",
    land: "Land",
    commercial: "Commercial",
    other: "Other",
  };
  return labels[type] || type;
}

// Helper to get loan type label
function getLoanTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    hard_money: "Hard Money",
    private: "Private Money",
    conventional: "Conventional",
    fha: "FHA",
    va: "VA",
    cash: "Cash",
    other: "Other",
  };
  return labels[type] || type;
}

export function DealAnalysisReport({ data }: { data: DealReportData }) {
  const getScoreStyle = () => {
    switch (data.dealScore) {
      case "Great": return styles.scoreCardGreat;
      case "Good": return styles.scoreCardGood;
      case "Marginal": return styles.scoreCardMarginal;
      default: return styles.scoreCardPass;
    }
  };

  const getScoreTextStyle = () => {
    switch (data.dealScore) {
      case "Great": return styles.scoreTextGreat;
      case "Good": return styles.scoreTextGood;
      case "Marginal": return styles.scoreTextMarginal;
      default: return styles.scoreTextPass;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>DF</Text>
            </View>
            <Text style={styles.companyName}>DealFlow</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>Deal Analysis Report</Text>
            <Text style={styles.dateText}>{data.generatedAt}</Text>
          </View>
        </View>

        {/* Property Address Banner */}
        <View style={styles.addressBanner}>
          <Text style={styles.propertyAddress}>{data.property.address}</Text>
          <Text style={styles.propertyLocation}>
            {data.property.city}, {data.property.state} {data.property.zip}
          </Text>
          <Text style={styles.propertyDetails}>
            {getPropertyTypeLabel(data.property.type)} • {data.property.bedrooms} Bed • {data.property.bathrooms} Bath • {data.property.sqft.toLocaleString()} sqft
            {data.property.yearBuilt ? ` • Built ${data.property.yearBuilt}` : ""}
          </Text>
        </View>

        {/* Deal Score Card */}
        <View style={[styles.scoreCard, getScoreStyle()]}>
          <View>
            <Text style={styles.scoreLabel}>Deal Score</Text>
            <Text style={[styles.scoreValue, getScoreTextStyle()]}>
              {data.dealScore} Deal
            </Text>
          </View>
          <View>
            <Text style={styles.scoreLabel}>Estimated ROI</Text>
            <Text style={[styles.scoreValue, getScoreTextStyle()]}>
              {data.financials.roi.toFixed(1)}%
            </Text>
          </View>
          <View>
            <Text style={styles.scoreLabel}>Net Profit</Text>
            <Text style={[styles.scoreValue, data.financials.profit >= 0 ? styles.scoreTextGreat : styles.scoreTextPass]}>
              {formatCurrency(data.financials.profit)}
            </Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.gridRow}>
          {/* Investment Summary */}
          <View style={[styles.section, styles.gridCol]}>
            <Text style={styles.sectionTitle}>Investment Summary</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Asking Price</Text>
              <Text style={styles.dataValue}>{formatCurrency(data.financials.askingPrice)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Repair Cost</Text>
              <Text style={styles.dataValue}>{formatCurrency(data.financials.repairCost)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Closing Costs (Buy)</Text>
              <Text style={styles.dataValue}>{formatCurrency(data.financials.closingCostsBuy)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Holding Costs</Text>
              <Text style={styles.dataValue}>{formatCurrency(data.financials.holdingCosts)}</Text>
            </View>
            <View style={styles.highlightBox}>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Total Investment</Text>
                <Text style={styles.highlightValue}>{formatCurrency(data.financials.totalInvestment)}</Text>
              </View>
            </View>
          </View>

          {/* Profit Analysis */}
          <View style={[styles.section, styles.gridCol]}>
            <Text style={styles.sectionTitle}>Profit Analysis</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>After Repair Value (ARV)</Text>
              <Text style={styles.dataValue}>{formatCurrency(data.financials.arv)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Less: Total Investment</Text>
              <Text style={styles.dataValue}>-{formatCurrency(data.financials.totalInvestment)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Less: Selling Costs (8%)</Text>
              <Text style={styles.dataValue}>-{formatCurrency(data.financials.sellingCosts)}</Text>
            </View>
            <View style={styles.highlightBox}>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Net Profit</Text>
                <Text style={[styles.highlightValue, data.financials.profit >= 0 ? styles.dataValueSuccess : styles.dataValueDanger]}>
                  {formatCurrency(data.financials.profit)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* MAO Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Allowable Offer (MAO)</Text>
          <View style={styles.gridRow}>
            <View style={[styles.highlightBox, styles.gridCol]}>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>70% MAO</Text>
                <Text style={styles.highlightValue}>{formatCurrency(data.financials.mao70)}</Text>
              </View>
              <Text style={[styles.dataLabel, { marginTop: 4 }]}>Conservative / Hedge Fund</Text>
            </View>
            {data.financials.mao75 && (
              <View style={[styles.highlightBox, styles.gridCol]}>
                <View style={styles.highlightRow}>
                  <Text style={styles.highlightLabel}>75% MAO</Text>
                  <Text style={styles.highlightValue}>{formatCurrency(data.financials.mao75)}</Text>
                </View>
                <Text style={[styles.dataLabel, { marginTop: 4 }]}>Standard</Text>
              </View>
            )}
          </View>
          <View style={[styles.dataRow, { marginTop: 12 }]}>
            <Text style={styles.dataLabel}>Current Ask vs 70% MAO</Text>
            <Text style={data.financials.askingPrice <= data.financials.mao70 ? styles.dataValueSuccess : styles.dataValueDanger}>
              {data.financials.askingPrice <= data.financials.mao70 ? "✓ Below MAO" : "✗ Above MAO"} 
              ({formatCurrency(data.financials.askingPrice - data.financials.mao70)})
            </Text>
          </View>
        </View>

        {/* Repair Breakdown */}
        {data.repairs && data.repairs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repair Breakdown</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Category</Text>
                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Description</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Cost</Text>
              </View>
              {data.repairs.map((repair, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{repair.category}</Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{repair.description || "-"}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>{formatCurrency(repair.cost)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Financing Details */}
        {data.financing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financing Details</Text>
            <View style={styles.gridRow}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Loan Type</Text>
                <Text style={styles.dataValue}>{getLoanTypeLabel(data.financing.loanType)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Loan Amount</Text>
                <Text style={styles.dataValue}>{formatCurrency(data.financing.loanAmount)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Interest Rate</Text>
                <Text style={styles.dataValue}>{data.financing.interestRate}%</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Term</Text>
                <Text style={styles.dataValue}>{data.financing.loanTerm} months</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by DealFlow • {data.generatedAt}
          </Text>
          <Text style={styles.footerText}>
            {data.agent ? `Prepared by: ${data.agent.name}` : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export type { DealReportData };
