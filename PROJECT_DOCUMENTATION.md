# DealFlow - Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** January 8, 2026  
**Created By:** Development Team  
**Platform:** SaaS Real Estate Deal Management  
**Production Cost:** $0/month (all free tiers)  
**Status:** Production Ready

---

# TABLE OF CONTENTS

1. [Executive Overview](#1-executive-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Pages & Routes](#7-pages--routes)
8. [API Routes (Backend)](#8-api-routes-backend)
9. [Components - Complete Reference](#9-components---complete-reference)
10. [Library Functions](#10-library-functions)
11. [Integrations](#11-integrations)
12. [Calculators](#12-calculators)
13. [PWA Features](#13-pwa-features)
14. [Admin Features](#14-admin-features)
15. [Deployment Guide](#15-deployment-guide)
16. [Troubleshooting](#16-troubleshooting)

---

# 1. EXECUTIVE OVERVIEW

## What is DealFlow?

DealFlow is a comprehensive real estate investment management platform that enables:

- **Deal Submission** - Agents/users submit properties for analysis
- **Underwriting** - Financial analysis with 6+ professional calculators
- **AI Scoring** - Automated deal quality assessment via Google Gemini
- **Pipeline Management** - Visual Kanban board with drag-and-drop
- **Team Collaboration** - Multi-user with role-based access
- **Custom Formulas** - Create proprietary calculation methods
- **Document Management** - PDF generation, file uploads
- **Contact CRM** - Manage buyers, sellers, agents

## Target Users

| User Type | Description | Count (US Market) |
|-----------|-------------|-------------------|
| Wholesalers | Buy low, assign/flip contracts | 300,000+ |
| Small Investment Firms | 1-20 employee teams | 50,000+ |
| Underwriting Teams | Financial analysis specialists | 10,000+ |
| Individual Investors | Solo operators | 500,000+ |

## Key Differentiators

| Feature | DealFlow | PropStream | Dealpath | REsimpli |
|---------|----------|------------|----------|----------|
| Custom Formula Builder | ✅ Drag-drop | ❌ | ❌ | ❌ |
| AI Deal Scoring | ✅ Free Gemini | ❌ | ✅ Paid | ❌ |
| Production Cost | $0/month | $99/mo | $5K+/mo | $149/mo |
| Real-time Collaboration | ✅ | ❌ | ✅ | ❌ |
| PWA Offline Support | ✅ | ❌ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ | ❌ |

---

# 2. TECHNOLOGY STACK

## 2.1 Frontend Technologies

| Technology | Version | Purpose | License |
|------------|---------|---------|---------|
| **Next.js** | 16.0.10 | React framework, App Router, SSR | MIT |
| **React** | 19.2.0 | UI component library | MIT |
| **TypeScript** | 5.9.3 | Static type checking | Apache 2.0 |
| **Tailwind CSS** | 4.x | Utility-first CSS framework | MIT |
| **Framer Motion** | 12.x | Animation library | MIT |
| **Radix UI** | Various | Accessible UI primitives | MIT |
| **Lucide React** | 0.555.0 | Icon library (240+ icons) | ISC |
| **Recharts** | 3.5.1 | Chart visualization | MIT |
| **React Hook Form** | 7.x | Form state management | MIT |
| **Zod** | 3.x | Schema validation | MIT |
| **Sonner** | 1.x | Toast notifications | MIT |
| **date-fns** | 2.x | Date manipulation | MIT |

## 2.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.0.10 | Serverless backend functions |
| **Supabase JS** | 2.86.0 | Database client, auth, storage |
| **Supabase SSR** | 0.8.0 | Server-side auth helpers |
| **Resend** | 4.2.0 | Transactional email service |
| **Google Generative AI** | 0.28.0 | Gemini AI client |

## 2.3 External Services (All Free Tier)

| Service | Free Limit | Monthly Cost | Purpose |
|---------|------------|--------------|---------|
| **Supabase** | 500MB DB, 2GB storage, 50K auth users | $0 | Database, Auth, Storage |
| **Google Gemini** | 1M tokens/day (~10K analyses) | $0 | AI deal scoring |
| **Geoapify** | 3K requests/day | $0 | Geocoding, maps |
| **Resend** | 100 emails/day (3K/month) | $0 | Email notifications |
| **Cloudinary** | 25GB storage, 25GB bandwidth | $0 | Image hosting |
| **Vercel** | 100GB bandwidth, unlimited deploys | $0 | Hosting |

**Total Production Cost: $0/month**

## 2.4 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting with Next.js config |
| TypeScript | Type checking |
| Sharp | Image optimization |
| Turbopack | Fast development builds (via Next.js) |

---

# 3. PROJECT STRUCTURE

## 3.1 Root Directory

```
dealflow/
├── .env.local              # Environment variables (secret)
├── .env.example            # Environment template (committed)
├── .gitignore              # Git ignore rules
├── components.json         # Shadcn UI configuration
├── eslint.config.mjs       # ESLint configuration
├── next-env.d.ts          # Next.js TypeScript declarations
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── postcss.config.mjs     # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment config
├── README.md              # Project readme
├── QUICK_START.md         # Quick start guide
├── ARCHITECTURE.md        # Architecture documentation
└── PROJECT_DOCUMENTATION.md # This file
```

## 3.2 Source Directory (`/src`)

```
src/
├── middleware.ts          # Auth middleware for protected routes
│
├── app/                   # Next.js App Router pages
│   ├── globals.css        # Global styles (Tailwind v4)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (/)
│   ├── favicon.ico        # Site favicon
│   │
│   ├── admin/             # Admin-only routes
│   │   ├── layout.tsx     # Admin auth guard (email check)
│   │   └── status/        # Status checker page
│   │
│   ├── api/               # API routes (serverless)
│   │   ├── cron/          # Scheduled jobs
│   │   ├── deals/         # Deal CRUD + scoring
│   │   ├── debug/         # Debug endpoints
│   │   ├── formulas/      # Custom formulas
│   │   ├── health/        # Health checks
│   │   ├── integrations/  # Integration status
│   │   ├── property/      # Property lookup
│   │   ├── team/          # Team management
│   │   ├── usage/         # Usage tracking
│   │   └── user/          # User endpoints
│   │
│   ├── auth/              # Auth callback pages
│   ├── calculators/       # Calculator pages
│   ├── dashboard/         # Main app dashboard
│   ├── login/             # Login page
│   ├── offline/           # Offline fallback page
│   ├── onboarding/        # User onboarding
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
│
├── components/            # React components
│   ├── analytics/         # Chart components
│   ├── auth/              # Auth forms
│   ├── dashboard/         # Dashboard widgets
│   ├── deals/             # Deal management
│   ├── documents/         # Document handling
│   ├── layout/            # Layout components
│   ├── notifications/     # Notification system
│   ├── pdf/               # PDF generation
│   ├── providers/         # Context providers
│   ├── pwa/               # PWA components
│   ├── settings/          # Settings forms
│   ├── status-checker/    # Health monitoring
│   └── ui/                # Shadcn UI components
│
├── lib/                   # Utility libraries
│   ├── actions/           # Server actions
│   ├── ai/                # AI integrations
│   ├── formulas/          # Formula engine
│   ├── hooks/             # React hooks
│   ├── integrations/      # External services
│   ├── schemas/           # Zod schemas
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
│
└── utils/                 # Supabase clients
    └── supabase/          # Client/server/middleware
```

## 3.3 Public Directory

```
public/
├── favicon.png            # Favicon image
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── icons/                 # PWA icons (72x72 to 512x512)
└── screenshots/           # App screenshots for PWA
```

## 3.4 Supabase Directory

```
supabase/
├── seed.sql               # Initial seed data
└── migrations/            # Database migrations
    ├── 003_notifications.sql
    ├── 004_audit_logs.sql
    ├── 005_full_platform.sql
    ├── 20250119_deal_comments.sql
    ├── 20250120_task_assignment.sql
    ├── 20250600_pre_multi_tenancy_data_migration.sql
    ├── 20250601_multi_tenancy.sql
    ├── 20250602_multi_tenancy_sync.sql
    ├── 20250603_invitation_system.sql
    ├── 20250604_fix_invitation_access.sql
    ├── 20250605_fix_invitation_trigger.sql
    ├── 20250606_fix_duplicate_triggers.sql
    ├── 20250607_fix_trigger_final.sql
    ├── 20251213_email_sequences.sql
    ├── 20251215_fix_linter_issues.sql
    ├── 20260106_contacts.sql
    ├── 20260107_freemium_usage.sql
    └── 20260108_user_profiles.sql
```

---

# 4. ENVIRONMENT CONFIGURATION

## 4.1 Required Variables

```bash
# ===========================================
# SUPABASE (REQUIRED)
# Get from: https://supabase.com/dashboard
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# ===========================================
# GOOGLE GEMINI AI (REQUIRED for AI features)
# Get from: https://makersuite.google.com/app/apikey
# FREE: 1M tokens/day
# ===========================================
GOOGLE_GEMINI_API_KEY=AIzaSyxxx...

# ===========================================
# GEOAPIFY (REQUIRED for maps/address lookup)
# Get from: https://www.geoapify.com/
# FREE: 3K requests/day
# ===========================================
NEXT_PUBLIC_GEOAPIFY_KEY=xxx...

# ===========================================
# RESEND (REQUIRED for email)
# Get from: https://resend.com
# FREE: 100 emails/day
# ===========================================
RESEND_API_KEY=re_xxx...
EMAIL_FROM=onboarding@resend.dev

# ===========================================
# ADMIN ACCESS (REQUIRED for /admin routes)
# Comma-separated emails allowed to access /admin/*
# ===========================================
ADMIN_EMAIL=admin@example.com
```

## 4.2 Optional Variables

```bash
# ===========================================
# CLOUDINARY (Optional - image hosting)
# Get from: https://cloudinary.com
# FREE: 25GB storage
# ===========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# ===========================================
# GOOGLE MAPS (Optional - legacy support)
# ===========================================
GOOGLE_MAPS_API_KEY=AIzaSyxxx...

# ===========================================
# DOCUSIGN (Optional - e-signatures)
# Returns mock data without config
# ===========================================
DOCUSIGN_INTEGRATION_KEY=xxx
DOCUSIGN_USER_ID=xxx
DOCUSIGN_ACCOUNT_ID=xxx

# ===========================================
# TWILIO (Optional - SMS notifications)
# ===========================================
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# ===========================================
# SLACK (Optional - team notifications)
# ===========================================
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxx

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DealFlow
```

---

# 5. DATABASE SCHEMA

## 5.1 Core Tables

### `user_profiles`
User information beyond Supabase auth.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | (FK auth.users) | Primary key |
| email | TEXT | - | User email |
| full_name | TEXT | - | Display name |
| avatar_url | TEXT | - | Profile picture URL |
| role | TEXT | 'member' | 'admin', 'member', 'viewer' |
| organization_id | UUID | - | Team/company |
| subscription_tier | TEXT | 'free' | 'free', 'pro', 'enterprise' |
| notification_preferences | JSONB | {...} | Email/SMS/push prefs |
| is_active | BOOLEAN | true | Account active |
| created_at | TIMESTAMPTZ | NOW() | Created timestamp |
| updated_at | TIMESTAMPTZ | NOW() | Updated timestamp |

### `organizations`
Team/company entities for multi-tenancy.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| name | TEXT | - | Company name |
| slug | TEXT | - | URL-friendly name |
| owner_id | UUID | - | Owner user ID |
| subscription_tier | TEXT | 'free' | Plan type |
| created_at | TIMESTAMPTZ | NOW() | Created timestamp |

### `deals`
Real estate deal records.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| organization_id | UUID | - | Owning org |
| user_id | UUID | - | Submitter |
| property_address | TEXT | - | Full address |
| city | TEXT | - | City |
| state | TEXT | - | State |
| zip_code | TEXT | - | ZIP |
| property_type | TEXT | 'single_family' | Type enum |
| status | TEXT | 'new' | Pipeline status |
| asking_price | NUMERIC(12,2) | - | Asking price |
| arv | NUMERIC(12,2) | - | After repair value |
| repair_cost | NUMERIC(12,2) | - | Estimated repairs |
| mao | NUMERIC(12,2) | - | Max allowable offer |
| wholesale_fee | NUMERIC(12,2) | - | Assignment fee |
| ai_score | INTEGER | - | AI score 1-100 |
| ai_analysis | JSONB | - | AI analysis data |
| priority | TEXT | 'medium' | Priority level |
| tags | TEXT[] | - | Custom tags |
| notes | TEXT | - | Internal notes |
| created_at | TIMESTAMPTZ | NOW() | Created |
| updated_at | TIMESTAMPTZ | NOW() | Updated |
| closed_at | TIMESTAMPTZ | - | When closed |

### `profiles` (Legacy)
Original profiles table.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (FK auth.users) |
| email | TEXT | Email |
| full_name | TEXT | Name |
| role | TEXT | User role |
| avatar_url | TEXT | Avatar |

## 5.2 Feature Tables

### `deal_activities`
Activity log for deals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| deal_id | UUID | FK deals |
| user_id | UUID | Who performed |
| activity_type | TEXT | Type of action |
| description | TEXT | Human-readable |
| metadata | JSONB | Extra data |
| created_at | TIMESTAMPTZ | When |

### `deal_comments`
Comments on deals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| deal_id | UUID | FK deals |
| user_id | UUID | Commenter |
| content | TEXT | Comment text |
| created_at | TIMESTAMPTZ | When |

### `usage_tracking`
Track user actions for freemium limits.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK auth.users |
| action_type | TEXT | 'deal_submit', 'ai_score', etc. |
| metadata | JSONB | Extra context |
| created_at | TIMESTAMPTZ | When |

### `user_formulas`
Custom formulas created by users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Creator |
| organization_id | UUID | Team sharing |
| name | TEXT | Formula name |
| description | TEXT | What it does |
| formula | TEXT | Formula expression |
| variables | JSONB | Variable definitions |
| is_public | BOOLEAN | Shared publicly |
| category | TEXT | Formula category |
| usage_count | INTEGER | Times used |
| created_at | TIMESTAMPTZ | Created |
| updated_at | TIMESTAMPTZ | Updated |

### `contacts`
CRM contact records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| organization_id | UUID | Org |
| type | TEXT | 'buyer', 'seller', 'agent', etc. |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| email | TEXT | Email |
| phone | TEXT | Phone |
| company | TEXT | Company name |
| notes | TEXT | Notes |
| tags | TEXT[] | Tags |
| created_at | TIMESTAMPTZ | Created |

### `email_sequences`
Automated email sequences.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| name | TEXT | Sequence name |
| trigger | TEXT | When to start |
| steps | JSONB | Email steps array |
| is_active | BOOLEAN | Currently active |

### `notifications`
User notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Recipient |
| type | TEXT | Notification type |
| title | TEXT | Title |
| message | TEXT | Body |
| read | BOOLEAN | Has been read |
| link | TEXT | Action URL |
| created_at | TIMESTAMPTZ | Created |

### `audit_logs`
System audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Who |
| action | TEXT | What action |
| entity_type | TEXT | 'deal', 'user', etc. |
| entity_id | UUID | Target ID |
| old_values | JSONB | Before |
| new_values | JSONB | After |
| ip_address | TEXT | Client IP |
| created_at | TIMESTAMPTZ | When |

## 5.3 Required Migrations (Run in Order)

1. `005_full_platform.sql` - Base tables, deal enhancements
2. `20260108_user_profiles.sql` - User profiles table
3. `20250601_multi_tenancy.sql` - Organizations table
4. `20260106_contacts.sql` - Contacts CRM table
5. `20260107_freemium_usage.sql` - Usage tracking + formulas

---

# 6. AUTHENTICATION & AUTHORIZATION

## 6.1 Authentication Flow

1. **Email/Password Login**
   - User enters email + password
   - Supabase Auth validates
   - Session cookie set
   - Redirect to `/dashboard`

2. **OAuth Login** (if configured)
   - Click provider button
   - Redirect to provider
   - Callback to `/auth/callback`
   - Session created

3. **Session Management**
   - Cookies managed by `@supabase/ssr`
   - Automatic refresh
   - Server-side validation in middleware

## 6.2 Authorization Levels

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Full access | All actions + user management |
| `member` | Standard user | CRUD own deals, view team |
| `viewer` | Read-only | View deals, no edits |

## 6.3 Admin Route Protection

File: `src/app/admin/layout.tsx`

```typescript
// Only allows users with email in ADMIN_EMAIL env var
const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',');

if (!ALLOWED_ADMIN_EMAILS.includes(user.email)) {
  redirect('/dashboard');
}
```

## 6.4 Middleware

File: `src/middleware.ts`

Protects routes starting with:
- `/dashboard` - Requires authentication
- `/admin` - Requires authentication (further check in layout)
- `/api/*` - Various auth requirements

---

# 7. PAGES & ROUTES

## 7.1 Public Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page |
| `/login` | `app/login/page.tsx` | Login form |
| `/auth/callback` | `app/auth/callback/route.ts` | OAuth callback |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms of service |
| `/offline` | `app/offline/page.tsx` | PWA offline page |

## 7.2 Dashboard Pages (Protected)

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard |
| `/dashboard/deals` | `app/dashboard/deals/page.tsx` | Deal pipeline |
| `/dashboard/deals/[id]` | `app/dashboard/deals/[id]/page.tsx` | Deal detail |
| `/dashboard/submit` | `app/dashboard/submit/page.tsx` | Submit new deal |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Analytics charts |
| `/dashboard/formulas` | `app/dashboard/formulas/page.tsx` | Formula builder |
| `/dashboard/contacts` | `app/dashboard/contacts/page.tsx` | CRM contacts |
| `/dashboard/team` | `app/dashboard/team/page.tsx` | Team management |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | User settings |
| `/dashboard/notifications` | `app/dashboard/notifications/page.tsx` | Notifications |
| `/dashboard/investor` | `app/dashboard/investor/page.tsx` | Investor portal |
| `/dashboard/usage` | `app/dashboard/usage/page.tsx` | Usage stats |

## 7.3 Calculator Pages

| Route | File | Description |
|-------|------|-------------|
| `/calculators` | `app/calculators/page.tsx` | Calculator index |
| `/calculators/mao` | `app/calculators/mao/page.tsx` | MAO calculator |
| `/calculators/arv` | `app/calculators/arv/page.tsx` | ARV calculator |
| `/calculators/roi` | `app/calculators/roi/page.tsx` | ROI calculator |
| `/calculators/repairs` | `app/calculators/repairs/page.tsx` | Repair estimator |
| `/calculators/financing` | `app/calculators/financing/page.tsx` | Financing calculator |
| `/calculators/1031` | `app/calculators/1031/page.tsx` | 1031 exchange |

## 7.4 Admin Pages

| Route | File | Description |
|-------|------|-------------|
| `/admin/status` | `app/admin/status/page.tsx` | System health checker |

---

# 8. API ROUTES (BACKEND)

## 8.1 Health Check APIs

### `GET /api/health/database`
Tests Supabase database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "message": "Database connection successful",
  "timestamp": "2026-01-08T12:00:00.000Z"
}
```

## 8.2 Integration Status APIs

### `GET /api/integrations/geoapify`
Tests Geoapify API key.

### `GET /api/integrations/gemini`
Tests Google Gemini API key.

### `GET /api/integrations/docusign`
Tests DocuSign configuration.

### `GET /api/integrations/email`
Tests Resend email service.

**Response Format (all):**
```json
{
  "status": "healthy" | "error",
  "message": "string",
  "timestamp": "ISO date"
}
```

## 8.3 User APIs

### `GET /api/user/role`
Get current user's role.

**Response:**
```json
{
  "role": "admin" | "member" | "viewer"
}
```

### `GET /api/user/organization`
Get current user's organization.

**Response:**
```json
{
  "organization": {
    "id": "uuid",
    "name": "Company Name",
    "slug": "company-name"
  }
}
```

## 8.4 Deal APIs

### `POST /api/deals/score`
AI score a deal using Google Gemini.

**Request:**
```json
{
  "dealId": "uuid",
  "propertyData": {
    "address": "string",
    "askingPrice": 150000,
    "arv": 250000,
    "repairCost": 30000
  }
}
```

**Response:**
```json
{
  "score": 85,
  "analysis": {
    "pros": ["string"],
    "cons": ["string"],
    "recommendation": "string"
  }
}
```

### `GET /api/deals/export`
Export deals as CSV.

### `POST /api/deals/formula`
Evaluate a formula against deal data.

### `POST /api/deals/report`
Generate PDF report for a deal.

## 8.5 Formula APIs

### `GET /api/formulas`
List user's custom formulas.

**Response:**
```json
{
  "formulas": [
    {
      "id": "uuid",
      "name": "My MAO Formula",
      "formula": "ARV * 0.70 - repairs",
      "variables": ["ARV", "repairs"]
    }
  ]
}
```

### `POST /api/formulas`
Create a new formula.

## 8.6 Usage APIs

### `GET /api/usage`
Get usage statistics.

**Response:**
```json
{
  "usage": {
    "dealsThisMonth": 15,
    "aiScoresThisMonth": 8,
    "limit": 50
  },
  "tier": "free"
}
```

### `POST /api/usage`
Track a usage action.

---

# 9. COMPONENTS - COMPLETE REFERENCE

## 9.1 Deal Components (`/src/components/deals/`)

### `deals-list.tsx`
Main deals listing with filtering and pagination.

**Props:** None (uses hooks for data)

**Features:**
- List view of all deals
- Status filtering
- Search by address
- Pagination
- Sort by date/price/score

### `kanban-board.tsx`
Drag-and-drop pipeline board.

**Features:**
- 9 status columns
- Drag to change status
- Deal count per column
- Quick actions menu

### `deal-submission-form.tsx`
Form to submit new deals.

**Fields:**
- Property address (with autocomplete)
- Property type
- Asking price
- Seller info
- Notes
- Photo uploads

### `deal-detail-client.tsx`
Full deal detail view.

**Sections:**
- Property info
- Financial summary
- AI score
- Comments
- Activity timeline
- Documents

### `ai-score-card.tsx`
Display AI deal score.

**Features:**
- Score 1-100 with color gradient
- Pros/cons list
- Recommendation
- Re-score button

### `property-lookup.tsx`
Address autocomplete with geocoding.

**Integration:** Geoapify API

### `formula-builder.tsx`
Visual formula creation tool.

**Features:**
- Drag-drop variables
- Math operators
- Preview results
- Save/load formulas

### `deal-templates.tsx`
Save and reuse deal configurations.

### `deal-tags.tsx`
Add/remove custom tags.

### `deal-notes.tsx`
Private notes per deal.

### `deal-checklist.tsx`
Track required steps.

### `bulk-actions.tsx`
Select multiple deals for actions.

### `comments.tsx`
Threaded comment system.

### `deal-timeline.tsx`
Activity history timeline.

### `comps-lookup.tsx`
Property comparables lookup.

### `deal-comparison.tsx`
Side-by-side deal comparison.

### `email-sequence-manager.tsx`
Manage email automation.

### `status-board.tsx`
Alternative status board view.

### `advanced-search.tsx`
Complex search filters.

### `import-deals.tsx`
CSV import functionality.

## 9.2 Dashboard Components (`/src/components/dashboard/`)

### `quick-stats-widget.tsx`
At-a-glance metrics.

**Displays:**
- Deals this month
- Total pipeline value
- Average score
- Close rate

### `recent-activity.tsx`
Live activity feed.

**Shows:**
- Deal submissions
- Status changes
- Comments
- Team actions

### `pipeline-chart.tsx`
Pipeline funnel visualization.

### `goal-tracker.tsx`
Track progress toward goals.

**Features:**
- Set monthly goals
- Progress bars
- Streak tracking

### `usage-dashboard.tsx`
Usage statistics display.

### `dashboard-charts.tsx`
Various chart visualizations.

### `widget-grid.tsx`
Customizable widget layout.

### `quick-actions.tsx`
Common action shortcuts.

### `reminders.tsx`
Task reminders.

## 9.3 UI Components (`/src/components/ui/`)

### Base Components (Shadcn)

| Component | Description |
|-----------|-------------|
| `button.tsx` | Button variants (primary, secondary, ghost, etc.) |
| `card.tsx` | Card container |
| `input.tsx` | Text input |
| `textarea.tsx` | Multi-line input |
| `select.tsx` | Dropdown select |
| `checkbox.tsx` | Checkbox input |
| `switch.tsx` | Toggle switch |
| `slider.tsx` | Range slider |
| `dialog.tsx` | Modal dialog |
| `alert-dialog.tsx` | Confirmation dialog |
| `dropdown-menu.tsx` | Context menu |
| `popover.tsx` | Popover container |
| `tooltip.tsx` | Hover tooltip |
| `tabs.tsx` | Tab navigation |
| `table.tsx` | Data table |
| `badge.tsx` | Status badge |
| `avatar.tsx` | User avatar |
| `progress.tsx` | Progress bar |
| `skeleton.tsx` | Loading skeleton |
| `separator.tsx` | Divider line |
| `scroll-area.tsx` | Scrollable container |
| `sheet.tsx` | Slide-out panel |
| `label.tsx` | Form label |
| `collapsible.tsx` | Expandable section |
| `command.tsx` | Command palette |

### Custom Components

| Component | Description |
|-----------|-------------|
| `address-autocomplete.tsx` | Address search with Geoapify |
| `currency-input.tsx` | Currency-formatted input |
| `file-dropzone.tsx` | File upload drop zone |
| `export-button.tsx` | CSV export button |
| `status-badge.tsx` | Deal status badge |
| `spinner.tsx` | Loading spinner |
| `toaster.tsx` | Toast notification container |
| `theme-toggle.tsx` | Light/dark mode toggle |
| `keyboard-shortcuts.tsx` | Shortcut helper |
| `keyboard-shortcuts-dialog.tsx` | Shortcuts modal |
| `command-palette.tsx` | Global command palette |
| `premium-badge.tsx` | Pro/Enterprise badge |
| `premium-button.tsx` | Upgrade prompt button |
| `premium-card.tsx` | Premium feature card |
| `premium-skeleton.tsx` | Enhanced skeleton |
| `page-transition.tsx` | Page transition animation |
| `activity-feed.tsx` | Activity timeline |
| `toggle-switch.tsx` | Labeled toggle |

## 9.4 Status Checker Components (`/src/components/status-checker/`)

### `status-grid.tsx`
Grid of health check cards.

**Props:**
```typescript
{
  results: HealthResult[];
  filter?: 'all' | 'api' | 'database' | 'feature' | 'integration';
}
```

### `health-metrics.tsx`
Summary metrics cards.

**Displays:**
- Healthy count
- Warning count
- Error count
- Average response time
- Total endpoints

### `error-log.tsx`
Scrollable error history.

**Features:**
- Timestamp
- Endpoint
- Error message
- Response time

## 9.5 Analytics Components (`/src/components/analytics/`)

### Chart Components
- `area-chart.tsx` - Area/line charts
- `bar-chart.tsx` - Bar charts
- `pie-chart.tsx` - Pie/donut charts

## 9.6 Layout Components (`/src/components/layout/`)

### `header.tsx`
App header with navigation.

### `sidebar.tsx`
Dashboard sidebar navigation.

## 9.7 Provider Components (`/src/components/providers/`)

### `theme-provider.tsx`
Dark/light theme context.

---

# 10. LIBRARY FUNCTIONS

## 10.1 AI Functions (`/src/lib/ai/deal-scoring.ts`)

### `scoreDeal(dealData: DealData): Promise<DealScore>`
Score a deal using Gemini AI.

**Input:**
```typescript
{
  address: string;
  askingPrice: number;
  arv: number;
  repairCost: number;
  propertyType: string;
}
```

**Output:**
```typescript
{
  score: number; // 1-100
  confidence: number; // 0-1
  pros: string[];
  cons: string[];
  recommendation: string;
  marketInsights: string;
}
```

### `analyzeDeal(dealData: DealData): Promise<Analysis>`
Detailed analysis without scoring.

### `validateFormula(formula: string): Promise<ValidationResult>`
Check formula syntax and logic.

### `getMarketInsights(address: string): Promise<MarketData>`
AI-generated market analysis.

## 10.2 Integration Functions (`/src/lib/integrations/`)

### Geoapify (`geoapify.ts`)

```typescript
// Geocode address to coordinates
geocodeAddress(address: string): Promise<GeoResult>

// Reverse geocode coordinates to address
reverseGeocode(lat: number, lng: number): Promise<Address>

// Address autocomplete suggestions
addressAutocomplete(query: string): Promise<Suggestion[]>
```

### Cloudinary (`cloudinary.ts`)

```typescript
// Get signed upload parameters
getUploadSignature(folder: string): Promise<UploadParams>

// Upload image
uploadImage(file: File, folder: string): Promise<UploadResult>

// Generate optimized URL
getOptimizedUrl(publicId: string, options: Options): string
```

### Property Data (`property-data.ts`)

```typescript
// Combined property lookup from free sources
lookupProperty(address: string): Promise<PropertyData>

// Get comparable sales
getComparables(lat: number, lng: number, radius: number): Promise<Comp[]>
```

## 10.3 Email Functions (`/src/lib/email.ts`)

```typescript
// Send transactional email
sendEmail(to: string, subject: string, html: string): Promise<Result>

// Send deal notification
sendDealNotification(deal: Deal, recipient: string): Promise<Result>

// Send welcome email
sendWelcomeEmail(user: User): Promise<Result>
```

## 10.4 Formula Engine (`/src/lib/formulas/formula-engine.ts`)

```typescript
// Parse formula string to AST
parseFormula(formula: string): FormulaAST

// Evaluate formula with variables
evaluateFormula(formula: string, variables: Record<string, number>): number

// Validate formula syntax
validateFormula(formula: string): ValidationResult

// Get required variables from formula
getVariables(formula: string): string[]
```

## 10.5 Health Checks (`/src/lib/health-checks.ts`)

```typescript
// Health check definition
interface HealthCheck {
  id: string;
  name: string;
  category: 'api' | 'database' | 'integration' | 'feature';
  endpoint: string;
  method: 'GET' | 'POST' | 'HEAD';
  timeout: number;
  description: string;
}

// Run a single health check
runHealthCheck(check: HealthCheck): Promise<HealthResult>

// All defined health checks
healthChecks: HealthCheck[]
```

## 10.6 Usage Tracking (`/src/lib/services/usage-tracking.ts`)

```typescript
// Track a user action
trackUsage(userId: string, action: string, metadata?: object): Promise<void>

// Get usage stats for user
getUsageStats(userId: string): Promise<UsageStats>

// Check if user has exceeded limits
checkLimits(userId: string, action: string): Promise<boolean>
```

## 10.7 Utility Functions (`/src/lib/utils.ts`)

```typescript
// Combine Tailwind classes
cn(...classes: ClassValue[]): string

// Format currency
formatCurrency(amount: number): string

// Format date
formatDate(date: Date | string): string

// Generate slug
slugify(text: string): string
```

---

# 11. INTEGRATIONS

## 11.1 Google Gemini AI

**Purpose:** AI deal scoring, analysis, formula validation

**Model:** `gemini-1.5-flash`

**Free Tier:** 1M tokens/day (~10K deal analyses)

**Configuration:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

**Usage Example:**
```typescript
const result = await model.generateContent(prompt);
const text = result.response.text();
```

## 11.2 Geoapify

**Purpose:** Geocoding, address autocomplete, maps

**Free Tier:** 3,000 requests/day

**Configuration:**
```typescript
const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
```

**Endpoints Used:**
- `/v1/geocode/search` - Address geocoding
- `/v1/geocode/reverse` - Reverse geocoding
- `/v1/geocode/autocomplete` - Address suggestions

## 11.3 Supabase

**Purpose:** Database, authentication, file storage

**Free Tier:** 500MB database, 2GB storage, 50K auth users

**Clients:**
```typescript
// Browser client
import { createClient } from '@/utils/supabase/client';

// Server client
import { createClient } from '@/utils/supabase/server';
```

## 11.4 Resend

**Purpose:** Transactional email

**Free Tier:** 100 emails/day

**Configuration:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@domain.com',
  to: 'user@example.com',
  subject: 'Subject',
  html: '<h1>Content</h1>'
});
```

## 11.5 Cloudinary

**Purpose:** Image hosting, optimization

**Free Tier:** 25GB storage, 25GB bandwidth

**Configuration:**
```typescript
const config = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
};
```

---

# 12. CALCULATORS

## 12.1 MAO Calculator (Maximum Allowable Offer)

**Location:** `/calculators/mao`

**Formula:**
```
MAO = ARV × Discount% - Repair Cost - Closing Costs - Wholesale Fee
```

**Variables:**
- ARV (After Repair Value)
- Discount % (default 70%)
- Repair Cost
- Closing Costs (default 5%)
- Wholesale Fee (default $10K)

## 12.2 ARV Calculator

**Location:** `/calculators/arv`

**Method:** Comparable sales analysis

**Inputs:**
- 3-6 comparable properties
- Property sqft
- Condition adjustments

## 12.3 Wholesale Calculator

**Location:** `/calculators` (main page)

**Formula:**
```
Profit = (ARV × 0.70) - Purchase Price - Repairs - Assignment Fee
```

## 12.4 Repair Estimator

**Location:** `/calculators/repairs`

**Categories:**
- Kitchen ($8K-$40K)
- Bathrooms ($3K-$15K each)
- Flooring ($3-$12/sqft)
- Roof ($5K-$15K)
- HVAC ($3K-$10K)
- Electrical ($2K-$8K)
- Plumbing ($2K-$10K)
- Paint ($1-$3/sqft)
- Windows ($300-$700 each)
- Foundation ($5K-$30K)

## 12.5 Financing Calculator

**Location:** `/calculators/financing`

**Calculations:**
- Monthly payment
- Total interest
- Amortization schedule
- Break-even analysis

## 12.6 1031 Exchange Calculator

**Location:** `/calculators/1031`

**Calculations:**
- Tax deferred amount
- Boot calculation
- Replacement property requirements
- Timeline requirements

---

# 13. PWA FEATURES

## 13.1 Manifest

**File:** `public/manifest.json`

```json
{
  "name": "DealFlow",
  "short_name": "DealFlow",
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone",
  "start_url": "/dashboard",
  "icons": [...]
}
```

## 13.2 Service Worker

**File:** `public/sw.js`

**Features:**
- Offline page caching
- API response caching
- Background sync
- Push notification handling

## 13.3 Install Prompt

**Component:** `src/components/pwa/pwa-install.tsx`

Prompts users to install the app on:
- iOS Safari (manual instructions)
- Android Chrome (automatic prompt)
- Desktop (automatic prompt)

## 13.4 Offline Support

**Offline Page:** `/offline`

Shows when user is offline with:
- Friendly message
- Retry button
- Cached content access

---

# 14. ADMIN FEATURES

## 14.1 Status Checker

**Route:** `/admin/status`

**Access:** Only emails in `ADMIN_EMAIL` environment variable

**Features:**
- Real-time health monitoring
- Auto-refresh every 30 seconds (toggleable)
- Manual refresh button
- Filter by category (API, Database, Feature, Integration)
- Export health report as JSON
- Response time tracking
- Error logging

**Monitored Endpoints:**
1. Usage API (`/api/usage`)
2. User Role API (`/api/user/role`)
3. User Organization API (`/api/user/organization`)
4. Database Health (`/api/health/database`)
5. Deals Feature (`/dashboard/deals`)
6. Analytics Feature (`/dashboard/analytics`)
7. Calculators Feature (`/calculators`)
8. Formula Builder (`/dashboard/formulas`)
9. Geoapify Maps (`/api/integrations/geoapify`)
10. Google Gemini AI (`/api/integrations/gemini`)
11. DocuSign (`/api/integrations/docusign`)
12. Email Service (`/api/integrations/email`)

---

# 15. DEPLOYMENT GUIDE

## 15.1 Prerequisites

- GitHub repository
- Vercel account (free)
- Supabase project (free)
- API keys for integrations

## 15.2 Vercel Deployment

1. **Connect Repository:**
   - Go to vercel.com
   - New Project → Import Git Repository
   - Select your repo

2. **Configure Build:**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables:**
   Add all variables from `.env.local` in Vercel dashboard

4. **Deploy:**
   - Click Deploy
   - Wait for build
   - Access via `.vercel.app` domain

## 15.3 Database Setup

1. **Create Supabase Project:**
   - Go to supabase.com
   - New Project
   - Note URL and anon key

2. **Run Migrations:**
   In SQL Editor, run files from `supabase/migrations/` in order:
   ```sql
   -- Run each file in order
   -- Start with 005_full_platform.sql
   -- Then chronologically by date prefix
   ```

3. **Configure Auth:**
   - Email auth enabled by default
   - Configure OAuth providers if needed
   - Set redirect URLs

## 15.4 Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Test user registration/login
- [ ] Test deal submission
- [ ] Test AI scoring
- [ ] Test email sending
- [ ] Check `/admin/status` shows green
- [ ] Configure custom domain (optional)

---

# 16. TROUBLESHOOTING

## 16.1 Common Issues

### "Cannot find module" errors
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Supabase connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Ensure RLS policies are configured

### AI scoring not working
- Verify `GOOGLE_GEMINI_API_KEY` is set
- Check token limits (1M/day)
- Ensure prompt is not too large

### Email not sending
- Verify `RESEND_API_KEY` is set
- Check sender domain verification
- Review Resend dashboard for errors

### Admin status page redirects
- Verify `ADMIN_EMAIL` contains your email
- Check for typos (case-sensitive)
- Restart server after .env changes

## 16.2 Debug Mode

Enable debug logging:
```bash
# In .env.local
DEBUG=true
```

Check API route: `/api/debug` (development only)

## 16.3 Getting Help

1. Check this documentation
2. Review error logs in Vercel dashboard
3. Check Supabase logs
4. Review browser console

---

# APPENDIX

## A. CRON Jobs (`/src/app/api/cron/`)

DealFlow includes 4 scheduled jobs that run automatically on Vercel:

### `cleanup/route.ts`
**Schedule:** Daily at 2 AM  
**Purpose:** Clean up expired data, orphaned records, and old temporary files.

```typescript
// Cleans:
// - Expired sessions
// - Orphaned file uploads
// - Old draft deals (>30 days)
// - Temporary calculation results
```

### `send-emails/route.ts`
**Schedule:** Every 5 minutes  
**Purpose:** Process email queue and send pending notifications.

```typescript
// Processes:
// - Queued deal notifications
// - Welcome emails
// - Password resets
// - Batch digest emails
```

### `send-reminders/route.ts`
**Schedule:** Daily at 9 AM  
**Purpose:** Send reminder emails for pending tasks and deals.

```typescript
// Sends reminders for:
// - Deals pending review >3 days
// - Tasks due today
// - Upcoming contract deadlines
// - Stale leads (no activity 7+ days)
```

### `weekly-report/route.ts`
**Schedule:** Sundays at 8 AM  
**Purpose:** Generate and send weekly summary reports.

```typescript
// Report includes:
// - Deals submitted this week
// - Deals closed this week
// - Pipeline value change
// - Top performing deals
// - Team activity summary
```

**Vercel Cron Configuration:**
```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 2 * * *" },
    { "path": "/api/cron/send-emails", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/send-reminders", "schedule": "0 9 * * *" },
    { "path": "/api/cron/weekly-report", "schedule": "0 8 * * 0" }
  ]
}
```

---

## B. Server Actions (`/src/lib/actions/`)

Next.js Server Actions for direct server mutations:

### `deal-actions.ts`
```typescript
// Create new deal
createDeal(data: DealInput): Promise<Deal>

// Update existing deal
updateDeal(id: string, data: Partial<Deal>): Promise<Deal>

// Delete deal
deleteDeal(id: string): Promise<void>

// Change deal status
updateDealStatus(id: string, status: string): Promise<Deal>

// Duplicate deal
duplicateDeal(id: string): Promise<Deal>
```

### `comment-actions.ts`
```typescript
// Add comment to deal
addComment(dealId: string, content: string): Promise<Comment>

// Edit comment
editComment(id: string, content: string): Promise<Comment>

// Delete comment
deleteComment(id: string): Promise<void>

// Get comments for deal
getComments(dealId: string): Promise<Comment[]>
```

### `attachment-actions.ts`
```typescript
// Upload file to deal
uploadAttachment(dealId: string, file: File): Promise<Attachment>

// Delete attachment
deleteAttachment(id: string): Promise<void>

// Get deal attachments
getAttachments(dealId: string): Promise<Attachment[]>
```

### `bulk-actions.ts`
```typescript
// Bulk update status
bulkUpdateStatus(dealIds: string[], status: string): Promise<void>

// Bulk delete deals
bulkDelete(dealIds: string[]): Promise<void>

// Bulk assign to user
bulkAssign(dealIds: string[], userId: string): Promise<void>

// Bulk add tags
bulkAddTags(dealIds: string[], tags: string[]): Promise<void>
```

### `formula-actions.ts`
```typescript
// Save custom formula
saveFormula(data: FormulaInput): Promise<Formula>

// Get user formulas
getUserFormulas(userId: string): Promise<Formula[]>

// Delete formula
deleteFormula(id: string): Promise<void>

// Execute formula
executeFormula(id: string, variables: Record<string, number>): Promise<number>
```

### `notification-actions.ts`
```typescript
// Get user notifications
getNotifications(userId: string): Promise<Notification[]>

// Mark as read
markAsRead(id: string): Promise<void>

// Mark all as read
markAllAsRead(userId: string): Promise<void>

// Delete notification
deleteNotification(id: string): Promise<void>
```

### `user-actions.ts`
```typescript
// Update profile
updateProfile(data: ProfileUpdate): Promise<User>

// Update preferences
updatePreferences(prefs: Preferences): Promise<void>

// Get user stats
getUserStats(userId: string): Promise<UserStats>
```

### `activity-actions.ts`
```typescript
// Log activity
logActivity(type: string, entityId: string, data: object): Promise<void>

// Get activity timeline
getActivityTimeline(entityId: string): Promise<Activity[]>

// Get user activity
getUserActivity(userId: string, limit: number): Promise<Activity[]>
```

### `audit-actions.ts`
```typescript
// Log audit entry
logAudit(action: string, entity: string, oldVal: object, newVal: object): Promise<void>

// Get audit trail
getAuditTrail(entityId: string): Promise<AuditLog[]>

// Export audit logs
exportAuditLogs(filters: AuditFilters): Promise<CSV>
```

### `email-actions.ts`
```typescript
// Queue email for sending
queueEmail(to: string, template: string, data: object): Promise<void>

// Send immediate email
sendImmediate(to: string, subject: string, html: string): Promise<void>

// Get email history
getEmailHistory(userId: string): Promise<EmailLog[]>
```

### `investor-actions.ts`
```typescript
// Add investor contact
addInvestor(data: InvestorInput): Promise<Investor>

// Update investor
updateInvestor(id: string, data: Partial<Investor>): Promise<Investor>

// Match investor to deal
matchInvestorToDeal(investorId: string, dealId: string): Promise<void>

// Get investor matches
getInvestorMatches(dealId: string): Promise<Investor[]>
```

### `recommendation-actions.ts`
```typescript
// Get AI recommendations
getRecommendations(dealId: string): Promise<Recommendation[]>

// Mark recommendation applied
markApplied(id: string): Promise<void>

// Dismiss recommendation
dismissRecommendation(id: string): Promise<void>
```

### `risk-actions.ts`
```typescript
// Assess deal risk
assessRisk(dealId: string): Promise<RiskAssessment>

// Get risk factors
getRiskFactors(dealId: string): Promise<RiskFactor[]>

// Update risk override
overrideRisk(dealId: string, level: string, reason: string): Promise<void>
```

### `settings-actions.ts`
```typescript
// Get organization settings
getOrgSettings(orgId: string): Promise<OrgSettings>

// Update organization settings
updateOrgSettings(orgId: string, settings: Partial<OrgSettings>): Promise<void>

// Get user settings
getUserSettings(userId: string): Promise<UserSettings>

// Update user settings
updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void>
```

### `deal-score.ts`
```typescript
// Calculate manual score
calculateScore(dealId: string): Promise<Score>

// Trigger AI scoring
triggerAIScoring(dealId: string): Promise<AIScore>

// Update score weights
updateScoreWeights(weights: ScoreWeights): Promise<void>
```

---

## C. Validation Schemas (`/src/lib/schemas/`)

Zod schemas for type-safe validation:

### `deal-submission.ts`
```typescript
// Deal submission validation
const dealSubmissionSchema = z.object({
  property_address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/),
  property_type: z.enum([
    'single_family', 'multi_family', 'condo', 
    'townhouse', 'land', 'commercial', 'industrial', 'mixed_use'
  ]),
  asking_price: z.number().min(0).max(100000000),
  arv: z.number().min(0).max(100000000).optional(),
  repair_cost: z.number().min(0).max(10000000).optional(),
  notes: z.string().max(5000).optional(),
  seller_name: z.string().max(100).optional(),
  seller_phone: z.string().max(20).optional(),
  seller_email: z.string().email().optional(),
});
```

### `underwriting.ts`
```typescript
// Underwriting data validation
const underwritingSchema = z.object({
  purchase_price: z.number().min(0),
  arv: z.number().min(0),
  repair_cost: z.number().min(0),
  holding_period_months: z.number().min(1).max(60),
  financing_type: z.enum(['cash', 'hard_money', 'conventional', 'seller_financing']),
  down_payment_percent: z.number().min(0).max(100),
  interest_rate: z.number().min(0).max(30),
  closing_costs_percent: z.number().min(0).max(10),
  wholesale_fee: z.number().min(0).optional(),
  desired_profit: z.number().min(0).optional(),
});
```

---

## D. React Hooks (`/src/lib/hooks/`)

Custom React hooks for shared logic:

### `use-ai-deal-scoring.ts`
```typescript
// Hook for AI deal scoring
function useAIDealScoring(dealId: string) {
  return {
    score: number | null,
    analysis: AIAnalysis | null,
    isLoading: boolean,
    error: Error | null,
    rescore: () => Promise<void>,
    lastScoredAt: Date | null
  }
}

// Usage:
const { score, analysis, rescore, isLoading } = useAIDealScoring(deal.id);
```

### `use-realtime.tsx`
```typescript
// Hook for Supabase realtime subscriptions
function useRealtime<T>(
  table: string,
  filter?: { column: string; value: string }
) {
  return {
    data: T[],
    isConnected: boolean,
    error: Error | null
  }
}

// Usage - subscribe to deal updates:
const { data: deals, isConnected } = useRealtime<Deal>('deals', {
  column: 'organization_id',
  value: orgId
});
```

---

## E. Provider Components (`/src/components/providers/`)

### `theme-provider.tsx`
Provides dark/light mode theming.

```typescript
// Wraps app with next-themes provider
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### `dashboard-providers.tsx`
Combines multiple providers for dashboard.

```typescript
// Provides:
// - Theme
// - Toaster (notifications)
// - Query client (if using React Query)
// - Auth context
```

---

## F. Settings Components (`/src/components/settings/`)

### `settings-client.tsx`
Main settings page container.

**Features:**
- Profile settings
- Notification preferences
- Integration status
- API keys management
- Team settings (admin only)

### `notification-preferences.tsx`
Email/SMS/push notification toggles.

**Options:**
- Deal submitted notifications
- Deal status change alerts
- Daily digest email
- Weekly summary report
- Team mentions
- System announcements

### `integrations-status.tsx`
View and manage integrations.

**Shows:**
- Connected services
- API key status (masked)
- Connection test buttons
- Last sync times

---

## G. Auth Components (`/src/components/auth/`)

### `two-factor-setup.tsx`
Two-factor authentication setup flow.

**Steps:**
1. Generate QR code
2. Scan with authenticator app
3. Enter verification code
4. Save backup codes

**Features:**
- TOTP (Google Authenticator, Authy)
- Backup codes display
- Recovery options

---

## H. Property Lookup API (`/src/app/api/property/lookup/`)

### `route.ts`
Unified property data lookup endpoint.

**Request:**
```typescript
POST /api/property/lookup
{
  "address": "123 Main St, City, ST 12345"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "address": {
      "street": "123 Main St",
      "city": "City",
      "state": "ST",
      "zip": "12345",
      "formatted": "123 Main St, City, ST 12345"
    },
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "parcel": {
      "apn": "123-456-789",
      "lot_size_sqft": 5000,
      "year_built": 1985,
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1800
    },
    "valuation": {
      "estimated_value": 350000,
      "tax_assessed_value": 280000,
      "last_sale_price": 250000,
      "last_sale_date": "2019-05-15"
    },
    "source": "geoapify"
  }
}
```

---

## I. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + K` | Open command palette |
| `⌘ + N` | New deal |
| `⌘ + /` | Toggle sidebar |
| `⌘ + D` | Go to dashboard |
| `⌘ + S` | Save current form |
| `Esc` | Close modal/dialog |

## J. PDF Components (`/src/components/pdf/`)

### `deal-analysis-report.tsx`
Generate PDF analysis reports for deals.

**Features:**
- Property summary section
- Financial breakdown table
- AI analysis summary
- Comparable sales section
- Charts and graphs
- Professional formatting
- Custom branding support

**Usage:**
```typescript
import { DealAnalysisReport } from '@/components/pdf/deal-analysis-report';

// Generate PDF
<DealAnalysisReport deal={deal} />
```

### `offer-pdf-template.tsx`
Generate offer letter PDFs.

**Includes:**
- Buyer information
- Property details
- Offer amount and terms
- Contingencies
- Signature lines
- Date fields

---

## K. Document Components (`/src/components/documents/`)

### `document-manager.tsx`
File upload and management interface.

**Features:**
- Drag-and-drop upload
- File type filtering
- Preview thumbnails
- Download/delete actions
- Folder organization

### `document-ocr.tsx`
OCR (Optical Character Recognition) for documents.

**Features:**
- Extract text from images
- Parse contracts automatically
- Fill forms from documents
- Identify key data points

### `document-preview.tsx`
Document preview modal.

**Supports:**
- PDF preview
- Image preview
- Document zoom
- Page navigation

---

## L. Notification Components (`/src/components/notifications/`)

### `notification-bell.tsx`
Bell icon with unread count badge.

**Features:**
- Animated bell on new notifications
- Unread count display
- Click to open dropdown

### `notification-list.tsx`
Dropdown list of notifications.

**Features:**
- Scrollable list
- Mark as read on click
- Time ago formatting
- Action links

### `notification-settings.tsx`
Notification preferences panel.

**Settings:**
- Email notifications toggle
- Push notifications toggle
- Notification frequency
- Quiet hours

---

## M. Analytics Components (`/src/components/analytics/`)

### `deal-analytics.tsx`
Deal performance analytics.

**Metrics:**
- Conversion rates
- Average deal size
- Time to close
- Win/loss ratio

### `pipeline-stats.tsx`
Pipeline health statistics.

**Displays:**
- Deals per stage
- Pipeline value
- Velocity metrics
- Bottleneck identification

### `market-trends.tsx`
Market trend visualization.

**Charts:**
- Price trends over time
- Inventory levels
- Days on market
- Regional comparisons

### `predictive-metrics.tsx`
AI-powered predictions.

**Predictions:**
- Deal success probability
- Expected close date
- Price appreciation forecast
- Risk indicators

### `activity-log.tsx`
Team activity timeline.

**Tracks:**
- User actions
- Deal updates
- System events
- Login history

---

## N. Layout Components (`/src/components/layout/`)

### `sidebar.tsx`
Main dashboard sidebar navigation.

**Sections:**
- Dashboard link
- Deals section
- Calculators section
- Analytics link
- Settings link
- User menu

### `mobile-sidebar.tsx`
Responsive mobile sidebar.

**Features:**
- Slide-out drawer
- Touch gestures
- Overlay backdrop
- Compact design

### `topbar.tsx` / `topbar-client.tsx`
Top navigation bar.

**Contains:**
- Page title
- Breadcrumbs
- Search bar
- User avatar
- Notification bell
- Theme toggle

### `premium-header.tsx`
Premium/upgrade header banner.

**Shows:**
- Current plan
- Usage limits
- Upgrade CTA

---

## O. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + K` | Open command palette |
| `⌘ + N` | New deal |
| `⌘ + /` | Toggle sidebar |
| `⌘ + D` | Go to dashboard |
| `⌘ + S` | Save current form |
| `Esc` | Close modal/dialog |

## P. Build Scripts (`/scripts/`)

### `generate-icons.js`
Generates PWA icons from SVG source.

**Generates:**
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 PNGs
- Apple Touch Icon (180x180)
- Favicon (32x32)

**Usage:**
```bash
node scripts/generate-icons.js
```

**Requirements:**
- `sharp` npm package

### `generate-screenshot.js`
Generates PWA screenshots for store listings.

**Usage:**
```bash
node scripts/generate-screenshot.js
```

---

## Q. Service Worker Details (`/public/sw.js`)

The service worker provides offline functionality:

**Cache Strategy:**
```javascript
const CACHE_NAME = 'dealflow-v1';
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/dashboard/deals',
  '/dashboard/analytics',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];
```

**Features:**
- Static asset caching on install
- Network-first strategy for API calls
- Cache-first strategy for static files
- Offline fallback page
- Background sync for offline actions
- Automatic cache cleanup on update

---

## R. shadcn/ui Configuration (`components.json`)

This project uses shadcn/ui for base components:

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Adding Components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

---

## S. Supabase Utilities (`/src/utils/supabase/`)

### `client.ts`
Browser-side Supabase client.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `server.ts`
Server-side Supabase client (for API routes and Server Components).

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookies) { /* ... */ }
      }
    }
  )
}
```

### `middleware.ts`
Supabase middleware helper for session refresh.

---

## T. Email Utilities (`/src/utils/email/`)

Email templating and sending utilities:

```typescript
// Email template types
type EmailTemplate = 
  | 'welcome'
  | 'deal-notification'
  | 'password-reset'
  | 'weekly-digest'
  | 'team-invite';

// Send templated email
sendTemplateEmail(
  to: string,
  template: EmailTemplate,
  data: Record<string, any>
): Promise<void>
```

---
