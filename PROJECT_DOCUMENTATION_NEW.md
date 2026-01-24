# DealFlow - Feature Documentation

**Version:** 2.0.0  
**Last Updated:** January 15, 2026

---

## Overview

DealFlow is a comprehensive real estate investment analysis platform designed for wholesalers, investors, and underwriting teams. It combines powerful analysis tools with team collaboration features to help you evaluate deals faster and make smarter investment decisions.

---

## Table of Contents

1. [Deal Analysis Hub](#1-deal-analysis-hub)
2. [Calculators](#2-calculators)
3. [AI Deal Scoring](#3-ai-deal-scoring)
4. [Custom Formula Builder](#4-custom-formula-builder)
5. [User Comps Database](#5-user-comps-database)
6. [Deal Submission Workflow](#6-deal-submission-workflow)
7. [Approval Workflow](#7-approval-workflow)
8. [Public Deal Sharing](#8-public-deal-sharing)
9. [Scout / Bird Dog Mode](#9-scout--bird-dog-mode)
10. [Contacts CRM](#10-contacts-crm)
11. [Team Management](#11-team-management)
12. [Analytics Dashboard](#12-analytics-dashboard)
13. [Notifications](#13-notifications)
14. [Document Management](#14-document-management)
15. [Theme System](#15-theme-system)
16. [Mobile & PWA](#16-mobile--pwa)
17. [Admin Features](#17-admin-features)

---

## 1. Deal Analysis Hub

The Analysis Hub is the central location for all deal analysis tools.

### Features

- **Unified dashboard** for all calculators
- **Property lookup** with address autocomplete
- **Quick access** to ARV, Repairs, ROI, MAO calculations
- **Side-by-side comparison** of multiple properties
- **Export analysis** as PDF reports

### Access

- Dashboard → Analysis Hub
- `/dashboard/analysis`

---

## 2. Calculators

### 2.1 ARV Calculator

Calculate After Repair Value using multiple methods.

**Features:**
- **Comp-based calculation** - Average of comparable sales with adjustments
- **Price per sqft method** - Uses market $/sqft × subject sqft
- **Confidence scoring** - Based on number and quality of comps
- **Manual comp entry** - Add your own comparable properties
- **Pull from database** - Use comps from your User Comps database

**Access:** `/dashboard/analysis/arv` or `/calculators/arv` (public)

---

### 2.2 Repair Estimator

Itemized repair cost estimation by category.

**Features:**
- **Room-by-room breakdown** - Kitchen, bathrooms, bedrooms, etc.
- **Category-based** - Roofing, HVAC, plumbing, electrical, flooring
- **Low/Medium/High estimates** - Range based on quality
- **Regional adjustments** - Labor cost variations by market
- **Voice notes** - Record repair observations hands-free
- **Photo attachments** - Document condition with images

**Categories:**
- Foundation & Structure
- Roofing
- HVAC
- Plumbing
- Electrical
- Flooring
- Kitchen
- Bathrooms
- Windows & Doors
- Paint & Drywall
- Landscaping
- Miscellaneous

**Access:** `/dashboard/analysis/repairs` or `/calculators/repairs` (public)

---

### 2.3 MAO Calculator

Calculate Maximum Allowable Offer.

**Features:**
- **70% Rule** - ARV × 0.70 - Repairs
- **Custom formulas** - Use your own proprietary method
- **Multiple exit strategies** - Flip, BRRRR, wholesale
- **Profit targets** - Set minimum acceptable profit
- **Quick scenarios** - Test different ARV and repair assumptions

**Variables:**
- ARV (After Repair Value)
- Repair Costs
- Holding Costs
- Closing Costs
- Profit Margin %
- Wholesale Fee (if applicable)

**Access:** `/dashboard/analysis/mao` or `/calculators/mao` (public)

---

### 2.4 ROI Calculator

Project return on investment.

**Features:**
- **Cash-on-cash return** - Annual cash flow / total cash invested
- **Cap rate** - NOI / purchase price
- **IRR calculation** - Internal rate of return over hold period
- **Multiple scenarios** - Compare flip vs hold vs BRRRR
- **Monthly breakdown** - Projected cash flow over time

**Metrics Calculated:**
- Total Investment
- Expected Profit
- ROI %
- Cash-on-Cash Return
- Annualized Return
- Break-even Analysis

**Access:** `/dashboard/analysis/roi` or `/calculators/roi` (public)

---

### 2.5 1031 Exchange Calculator

Plan tax-deferred exchanges.

**Features:**
- **Timeline tracking** - 45-day identification, 180-day close
- **Like-kind matching** - Find replacement properties
- **Boot calculation** - Taxable portion if applicable
- **Tax savings estimate** - Deferred capital gains
- **Exchange advisor** - Recommendations for structure

**Access:** `/calculators/1031` (public)

---

### 2.6 Financing Calculator

Compare loan scenarios.

**Features:**
- **Hard money loans** - Short-term, high interest
- **Conventional financing** - Traditional mortgages
- **Portfolio loans** - Bank portfolio products
- **Private money** - Investor financing
- **Payment schedules** - Amortization tables
- **Total cost comparison** - Which loan is cheapest?

**Calculated:**
- Monthly Payment
- Total Interest Paid
- Points & Fees
- Debt Service Coverage Ratio (DSCR)
- Loan-to-Value (LTV)
- Loan-to-Cost (LTC)

**Access:** `/calculators/financing` (public)

---

## 3. AI Deal Scoring

Every deal gets scored by our AI underwriter powered by Google Gemini.

### How It Works

1. Deal data is sent to AI model
2. AI analyzes property fundamentals, financial metrics, and market factors
3. Returns a 1-100 score with detailed breakdown

### Score Components

- **Property Fundamentals (40%)**
  - Location quality
  - Property condition
  - Market demand

- **Financial Metrics (40%)**
  - Profit margin vs market average
  - Cash-on-cash return
  - Risk vs reward ratio

- **Strategic Fit (20%)**
  - Exit strategy viability
  - Market saturation
  - Seasonal factors

### Score Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 85-100 | Strong Buy | Make an offer |
| 70-84 | Good | Review details |
| 50-69 | Average | Negotiate harder |
| 30-49 | Below Average | Caution advised |
| 0-29 | Pass | Numbers don't work |

### Output

- Overall score (1-100)
- Pros list
- Cons list
- Recommendation (Pass / Review / Strong Buy)
- Confidence level

**Access:** Automatic on deal submission, or click "Re-score" on any deal

---

## 4. Custom Formula Builder

Create your own proprietary calculation methods.

### Features

- **Drag-and-drop interface** - Build formulas visually
- **Variables library** - ARV, Repairs, Purchase Price, etc.
- **Mathematical operators** - Add, subtract, multiply, divide, percentages
- **Preview results** - Test formula with sample data
- **Save and reuse** - Apply to any deal
- **Share with team** - Organization-level formulas
- **Public formulas** - Share with community (optional)

### Available Variables

| Variable | Description |
|----------|-------------|
| `ARV` | After Repair Value |
| `REPAIRS` | Total Repair Cost |
| `PURCHASE` | Purchase Price |
| `SQFT` | Square Footage |
| `BEDS` | Number of Bedrooms |
| `BATHS` | Number of Bathrooms |
| `HOLDING` | Holding Costs |
| `CLOSING` | Closing Costs |

### Example Formulas

**Standard MAO:**
```
ARV * 0.70 - REPAIRS
```

**Conservative Wholesale:**
```
ARV * 0.65 - REPAIRS - 10000
```

**Cash-on-Cash Target:**
```
(ARV - PURCHASE - REPAIRS) / (PURCHASE * 0.20) * 100
```

**Access:** `/dashboard/formulas` or `/dashboard/analysis/formula`

---

## 5. User Comps Database

Build your own comparable sales database for accurate ARV calculations.

### Features

- **Submit comps manually** - Enter your own comp data
- **Search and filter** - By location, beds, baths, sqft, price
- **Use in calculations** - Pull comps into ARV calculator
- **Organization-wide** - Share comps with your team
- **Community sharing** - Optionally share with all users
- **Verification system** - Mark comps as verified

### Comp Data Fields

**Location:**
- Address, City, State, ZIP
- County
- Latitude/Longitude (auto-geocoded)

**Property Details:**
- Property Type (SFH, Townhouse, Condo, Multi-family)
- Bedrooms, Bathrooms
- Square Footage, Lot Size
- Year Built, Stories
- Garage Spaces, Pool

**Sale Information:**
- Sale Price
- Sale Date
- Price per Sqft (auto-calculated)
- Condition (Excellent/Good/Fair/Poor/Distressed)
- Was Renovated
- Renovation Cost

**Metadata:**
- Source (User Submitted, MLS, Public Records)
- MLS Number
- Photos
- Notes
- Verified status

### Database Functions

**Find Nearby Comps:**
Search comps within a radius of a target property, filtered by beds, property type, and sqft range.

**Calculate ARV from Comps:**
Automatically estimate ARV based on nearby comps with confidence scoring.

**Access:** `/dashboard/comps`

---

## 6. Deal Submission Workflow

Streamlined deal entry for teams.

### Submission Steps

1. **Property Address** - Auto-complete with geocoding
2. **Basic Info** - Property type, beds, baths, sqft
3. **Pricing** - Asking price, seller motivation
4. **Condition** - Photo uploads, repair notes
5. **Financing** - Loan type, down payment
6. **Submit** - Automatically calculates metrics

### Features

- **Voice notes** - Record observations while walking property
- **Photo upload** - Camera integration on mobile
- **Auto-calculations** - ARV, MAO, ROI computed automatically
- **Draft saving** - Resume incomplete submissions
- **Template deals** - Quick-start from saved templates

### Deal Statuses

| Status | Description |
|--------|-------------|
| Draft | In progress, not submitted |
| New | Submitted, awaiting review |
| Under Review | Assigned to underwriter |
| Changes Requested | Sent back for more info |
| Approved | Ready for offers |
| Under Contract | Offer accepted |
| Closed | Transaction complete |
| Rejected | Did not pass underwriting |
| Archived | Inactive |

**Access:** `/dashboard/submit`

---

## 7. Approval Workflow

Collaborative review process for teams.

### Workflow

1. **Agent submits deal** → Status: New
2. **Underwriter reviews** → Status: Under Review
3. **Decision made:**
   - ✅ Approved → Moves to pipeline
   - ⚠️ Changes Requested → Back to agent
   - ❌ Rejected → Archived with reason

### Features

- **Comments and feedback** - Threaded discussions
- **Override calculations** - Underwriter can adjust numbers
- **Activity timeline** - Full history of changes
- **Notification alerts** - Email when action required
- **Audit trail** - Who did what and when

**Access:** Deal detail page → Approval tab

---

## 8. Public Deal Sharing

Share deals with external parties without requiring login.

### Features

- **Secure share links** - UUID-based tokens
- **Read-only view** - Cannot edit, only view
- **Professional presentation** - Clean deal summary
- **Expiration optional** - Set link expiry date
- **Revoke access** - Disable links anytime

### Use Cases

- Share with investors for funding
- Send to partners for review
- Present to lenders
- Client presentations

**How to Share:**
1. Open deal detail
2. Click "Share" button
3. Copy generated link
4. Send to recipient

**Access:** `/share/[token]` (public, no login required)

---

## 9. Scout / Bird Dog Mode

Capture leads in the field without an account.

### Features

- **QR code generator** - Print for scouts to scan
- **No login required** - Submit leads anonymously
- **Photo upload** - Capture from mobile camera
- **Basic info only** - Address, condition, notes
- **Direct to pipeline** - Leads appear as new deals

### Use Cases

- Bird dogs driving for dollars
- Scouts reporting distressed properties
- Door knockers submitting leads
- Uber drivers, delivery workers, etc.

**Setup:**
1. Go to Settings → Scout Mode
2. Generate your QR code
3. Print and distribute

**Access:** `/scout` (public, no login required)

---

## 10. Contacts CRM

Basic CRM for managing deal relationships.

### Contact Types

- **Buyers** - Cash buyers, investors
- **Sellers** - Property owners
- **Agents** - Real estate agents
- **Lenders** - Hard money, banks
- **Contractors** - Repair specialists
- **Attorneys** - Title, closing
- **Other** - Custom types

### Features

- **Contact profiles** - Name, email, phone, company
- **Link to deals** - Associate contacts with properties
- **Notes and tags** - Internal organization
- **Quick search** - Find contacts fast
- **Import/Export** - CSV support

**Access:** `/dashboard/contacts`

---

## 11. Team Management

Multi-user collaboration with role-based access.

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management, settings |
| **Underwriter** | Review deals, approve/reject, analytics |
| **Agent** | Submit deals, view own deals |
| **Investor** | Investor portal, funding requests |

### Features

- **Invite members** - Email invitations with secure tokens
- **Role assignment** - Set permissions per user
- **Organization settings** - Company-wide preferences
- **Activity monitoring** - See who's doing what
- **Remove members** - Revoke access instantly

### Data Isolation

- Teams only see their own data
- Row-level security (RLS) in database
- No cross-organization data leakage

**Access:** `/dashboard/team` (Admin only)

---

## 12. Analytics Dashboard

Track team performance and deal metrics.

### Metrics

- **Deal Volume** - Total deals over time
- **Conversion Rate** - Submitted → Closed
- **Average ROI** - By property type
- **Pipeline Value** - Total potential profit
- **Team Leaderboard** - Top performers

### Charts

- Deal volume by month (bar chart)
- Pipeline distribution (pie chart)
- ROI trends (line chart)
- Deal status breakdown (donut chart)

### Filters

- Date range
- Property type
- Team member
- Deal status

**Access:** `/dashboard/analytics`

---

## 13. Notifications

Stay updated on deal activity.

### Notification Types

- **New deal submitted** - For underwriters
- **Deal approved/rejected** - For agents
- **Comment added** - For deal participants
- **Mention** - When @mentioned in comments
- **Task assigned** - For team tasks
- **System alerts** - Important updates

### Delivery Methods

- **In-app** - Bell icon in header
- **Email** - Configurable per type
- **Push** - PWA notifications (if enabled)

### Settings

Configure which notifications you receive:
- Instant vs digest
- Email on/off per type
- Push on/off

**Access:** `/dashboard/notifications` or bell icon in header

---

## 14. Document Management

Handle deal-related documents.

### Features

- **PDF generation** - Professional deal reports
- **File uploads** - Contracts, photos, inspections
- **Document storage** - Organized by deal
- **Download/Share** - Export documents
- **Branded reports** - Company logo on PDFs

### PDF Reports Include

- Executive summary
- Property overview + photos
- Market analysis (comps)
- Repair analysis (itemized)
- Financial projections
- Investment recommendation
- Risk assessment

**Access:** Deal detail → Documents tab

---

## 15. Theme System

Customize your visual experience.

### Options

- **Light Mode** - Bright, clean interface
- **Dark Mode** - Easy on the eyes, saves battery
- **System** - Match your device preference

### Persistence

- Theme saved to browser
- Synced across sessions
- No flash on page load

**Access:** Click theme icon in header

---

## 16. Mobile & PWA

Use DealFlow on any device.

### Progressive Web App (PWA)

- **Install on phone** - Add to home screen
- **Offline support** - View deals without internet
- **Push notifications** - Real-time alerts
- **Fast loading** - Service worker caching

### Mobile Features

- **Responsive design** - Works on all screen sizes
- **Touch-optimized** - Swipe gestures, large tap targets
- **Camera access** - Photo uploads
- **Voice input** - Speech-to-text for notes
- **GPS location** - Auto-fill address

**Access:** Any modern browser, or install as PWA

---

## 17. Admin Features

Special tools for administrators.

### User Management

- View all users
- Change roles
- Disable accounts
- View activity logs

### System Health

- Database status
- API integrations status
- Error monitoring
- Performance metrics

### Audit Logs

- All user actions logged
- Who, what, when
- Exportable reports

**Access:** `/dashboard/admin/*` (Admin only)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Jan 15, 2026 | User Comps, Theme System, Documentation Update |
| 1.5.0 | Jan 10, 2026 | Scout Mode, Share Links, Voice Notes |
| 1.0.0 | Jan 8, 2026 | Initial release |

---

*Last updated: January 15, 2026*
