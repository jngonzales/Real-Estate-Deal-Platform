# 🏠 DealFlow - Project Architecture Documentation

> **Enterprise Real Estate Deal Management Platform**  
> Built with Next.js 16, React 19, Supabase, and Tailwind CSS v4

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Diagram](#architecture-diagram)
- [Authentication & Authorization](#authentication--authorization)
- [Multi-Tenancy](#multi-tenancy)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Core Workflows](#core-workflows)
- [UI Components](#ui-components)
- [Integrations](#integrations)
- [Scheduled Jobs](#scheduled-jobs)

---

## Overview

DealFlow is a full-stack real estate investment platform that enables teams to:

1. **Submit deals** - Agents submit properties for analysis
2. **Analyze deals** - Underwriters run financial calculations
3. **Approve/Fund** - Admins approve and investors fund deals

The platform supports multiple organizations with complete data isolation, role-based access control, and professional-grade calculators.

---

## Tech Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.0.10 | App Router, SSR, API routes |
| **Frontend** | React | 19 | Component architecture |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Library** | Shadcn/Radix | Latest | Accessible components |
| **Animations** | Framer Motion | 11.18 | Smooth transitions |
| **Database** | Supabase | Latest | PostgreSQL + Auth + Storage |
| **Email** | Resend | 6.6.0 | Transactional emails |
| **Charts** | Recharts | Latest | Data visualization |
| **PDF** | @react-pdf/renderer | Latest | Document generation |
| **Forms** | React Hook Form + Zod | Latest | Validation |

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Supabase** | Database, Auth, Storage | ✅ Required |
| **Resend** | Email delivery | ✅ Configured |
| **Google Maps** | Drive time calculations | ✅ Configured |
| **PropStream** | Property comps data | 🔧 Mock (needs subscription) |
| **DocuSign** | E-signatures | 🔧 Mock (needs account) |

---

## Project Structure

```
real-estate-deal-platform/
├── public/
│   ├── icons/                    # PWA icons (72x72 to 512x512)
│   ├── sw.js                     # Service worker
│   └── manifest.json             # PWA manifest
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── cron/             # Scheduled jobs
│   │   │   │   ├── cleanup/      # Daily cleanup
│   │   │   │   ├── weekly-report/# Weekly stats
│   │   │   │   └── send-reminders/# Daily reminders
│   │   │   ├── deals/            # Deal operations
│   │   │   │   ├── route.ts      # Create deal
│   │   │   │   ├── export/       # CSV export
│   │   │   │   └── [id]/         # Deal CRUD + PDF
│   │   │   ├── integrations/     # External APIs
│   │   │   │   ├── propstream/   # Comps data
│   │   │   │   ├── docusign/     # E-signatures
│   │   │   │   ├── drive-time/   # Google Maps
│   │   │   │   └── status/       # Integration status
│   │   │   ├── team/             # Team management
│   │   │   │   ├── invite/       # Send invitations
│   │   │   │   ├── invitation/   # Check invitation
│   │   │   │   └── members/      # List members
│   │   │   └── user/             # User management
│   │   │       ├── profile/      # Get/update profile
│   │   │       ├── role/         # Get user role
│   │   │       └── organization/ # Get org info
│   │   │
│   │   ├── auth/                 # Auth pages
│   │   │   ├── callback/         # OAuth/email callback
│   │   │   └── update-password/  # Password reset
│   │   │
│   │   ├── dashboard/            # Protected app (requires login)
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   │   ├── admin/            # Admin-only pages
│   │   │   │   ├── users/        # User management
│   │   │   │   ├── funding/      # Funding queue
│   │   │   │   └── audit-logs/   # Activity logs
│   │   │   ├── analysis/         # Calculator suite
│   │   │   │   ├── page.tsx      # Analysis hub
│   │   │   │   ├── arv/          # ARV Calculator
│   │   │   │   ├── mao/          # MAO Calculator
│   │   │   │   ├── roi/          # ROI Calculator
│   │   │   │   ├── repairs/      # Repair Estimator
│   │   │   │   ├── financing/    # Financing Calculator
│   │   │   │   └── 1031/         # 1031 Exchange
│   │   │   ├── analytics/        # Charts & reports
│   │   │   ├── contacts/         # CRM / Contacts
│   │   │   ├── deals/            # Deal management
│   │   │   │   ├── page.tsx      # Deal list
│   │   │   │   └── [id]/         # Deal detail + underwriting
│   │   │   ├── investor/         # Investor portal
│   │   │   ├── notifications/    # Notification center
│   │   │   ├── settings/         # User settings
│   │   │   ├── submit/           # Submit new deal
│   │   │   └── team/             # Team management
│   │   │
│   │   ├── calculators/          # Public calculator pages
│   │   ├── login/                # Login/signup page
│   │   ├── onboarding/           # Post-signup wizard
│   │   ├── offline/              # PWA offline page
│   │   ├── privacy/              # Privacy policy
│   │   ├── terms/                # Terms of service
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── analytics/            # Chart components
│   │   ├── auth/                 # Auth components
│   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── dashboard-charts.tsx
│   │   │   └── dashboard-activity.tsx
│   │   ├── deals/                # Deal components
│   │   │   ├── deal-detail-client.tsx
│   │   │   ├── deals-page-client.tsx
│   │   │   ├── comments.tsx
│   │   │   ├── assign-deal.tsx
│   │   │   └── deal-score-display.tsx
│   │   ├── documents/            # Document components
│   │   ├── layout/               # Layout components
│   │   │   ├── sidebar.tsx       # Desktop sidebar
│   │   │   ├── mobile-sidebar.tsx# Mobile nav
│   │   │   ├── topbar.tsx        # Header with user menu
│   │   │   └── premium-header.tsx# Animated header
│   │   ├── notifications/        # Notification UI
│   │   ├── pdf/                  # PDF templates
│   │   │   └── offer-pdf-template.tsx
│   │   ├── providers/            # Context providers
│   │   ├── pwa/                  # PWA components
│   │   ├── settings/             # Settings components
│   │   └── ui/                   # Base UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── premium-card.tsx  # Glassmorphism card
│   │       ├── premium-badge.tsx # Status badges
│   │       └── ...               # Shadcn components
│   │
│   ├── lib/
│   │   ├── actions/              # Server actions
│   │   │   ├── deal-actions.ts   # Deal CRUD
│   │   │   ├── user-actions.ts   # User management
│   │   │   ├── investor-actions.ts
│   │   │   └── audit-actions.ts
│   │   ├── formulas/             # Calculation engines
│   │   │   ├── arv.ts
│   │   │   ├── mao.ts
│   │   │   ├── roi.ts
│   │   │   └── deal-score.ts
│   │   ├── hooks/                # Custom React hooks
│   │   ├── integrations/         # API wrappers
│   │   │   ├── index.ts          # Integration status
│   │   │   ├── propstream.ts
│   │   │   ├── docusign.ts
│   │   │   └── google-maps.ts
│   │   ├── schemas/              # Zod validation
│   │   │   ├── deal.ts
│   │   │   └── property.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── deal-number.ts    # Deal # formatting
│   │   │   └── format.ts
│   │   ├── auth-actions.ts       # Login/signup/logout
│   │   ├── email.ts              # Resend email service
│   │   └── utils.ts              # General utils (cn, etc.)
│   │
│   ├── utils/
│   │   ├── supabase/             # Supabase clients
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client + service role
│   │   │   └── middleware.ts     # Auth middleware
│   │   └── email/                # Email templates
│   │
│   └── middleware.ts             # Route protection
│
├── supabase/
│   ├── migrations/               # Database migrations
│   │   ├── 003_notifications.sql
│   │   ├── 004_audit_logs.sql
│   │   ├── 005_full_platform.sql
│   │   ├── 20250119_deal_comments.sql
│   │   ├── 20250120_task_assignment.sql
│   │   ├── 20250600_pre_multi_tenancy_data_migration.sql
│   │   ├── 20250601_multi_tenancy.sql
│   │   ├── 20250602_multi_tenancy_sync.sql
│   │   ├── 20250603_invitation_system.sql
│   │   ├── 20250604_fix_invitation_access.sql
│   │   └── 20251213_email_sequences.sql
│   └── seed.sql                  # Sample data
│
├── scripts/                      # Build scripts
├── .env.local                    # Environment variables
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           FRONTEND                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Landing Page    │  │   Dashboard      │  │  Calculators  │  │
│  │  (Public)        │  │   (Protected)    │  │  (Public)     │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│           │                    │                    │            │
│           └────────────────────┴────────────────────┘            │
│                                │                                 │
│                    ┌───────────┴───────────┐                     │
│                    │   Next.js App Router  │                     │
│                    │   Server Components   │                     │
│                    └───────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                           API LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ /api/deals  │ │ /api/user   │ │ /api/team   │ │ /api/cron  │ │
│  │             │ │             │ │             │ │            │ │
│  │ - CRUD      │ │ - Profile   │ │ - Invite    │ │ - Cleanup  │ │
│  │ - Export    │ │ - Role      │ │ - Members   │ │ - Reports  │ │
│  │ - PDF       │ │ - Org       │ │ - Accept    │ │ - Remind   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    /api/integrations                        ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ ││
│  │  │ PropStream │ │  DocuSign  │ │ Google Maps│ │  Resend  │ ││
│  │  │   (Comps)  │ │  (E-Sign)  │ │(Drive Time)│ │  (Email) │ ││
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATABASE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Supabase (PostgreSQL)                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                             ││
│  │  Core Tables:                                               ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        ││
│  │  │   profiles   │ │organizations │ │ invitations  │        ││
│  │  │  (users)     │ │  (tenants)   │ │ (team join)  │        ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘        ││
│  │                                                             ││
│  │  Deal Tables:                                               ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        ││
│  │  │    deals     │ │  properties  │ │ underwriting │        ││
│  │  │              │ │              │ │    _data     │        ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘        ││
│  │                                                             ││
│  │  Supporting Tables:                                         ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        ││
│  │  │notifications │ │  audit_logs  │ │deal_comments │        ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘        ││
│  │                                                             ││
│  │  Security: Row-Level Security (RLS) on all tables          ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Auth Flow

```
User visits /login
       │
       ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Email/Password     │ or  │  Invite Link        │
│  Login/Signup       │     │  (?invite=token)    │
└─────────────────────┘     └─────────────────────┘
       │                              │
       ▼                              ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Supabase Auth      │     │  Check Invitation   │
│  Email Confirmation │     │  Show org name      │
└─────────────────────┘     └─────────────────────┘
       │                              │
       └──────────────┬───────────────┘
                      ▼
              ┌───────────────┐
              │ /auth/callback │
              └───────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Has Invitation? │ YES │ Process invite  │
│                 │────▶│ Join org        │
└─────────────────┘     │ Skip onboarding │
          │ NO          └─────────────────┘
          ▼                       │
┌─────────────────┐               │
│ Has Org?        │               │
└─────────────────┘               │
    │ NO     │ YES                │
    ▼        ▼                    ▼
┌────────┐ ┌──────────┐  ┌──────────────┐
│Onboard │ │Onboarding│  │  /dashboard  │
│ wizard │ │completed?│  │              │
└────────┘ └──────────┘  └──────────────┘
```

### Role-Based Access Control (RBAC)

| Role | Dashboard | Deals | Analytics | Admin | Investor Portal |
|------|-----------|-------|-----------|-------|-----------------|
| **Admin** | ✅ Full | ✅ All deals | ✅ Full | ✅ Users, Logs, Funding | ❌ |
| **Underwriter** | ✅ Full | ✅ All deals | ✅ Full | ✅ Funding only | ❌ |
| **Agent** | ✅ Limited | ✅ Own deals | ❌ | ❌ | ❌ |
| **Investor** | ❌ | ❌ | ❌ | ❌ | ✅ Full |

### Route Protection

Protected by `src/middleware.ts`:

- All `/dashboard/*` routes require authentication
- Admin routes check role in page components
- API routes verify auth and role on each request

---

## Multi-Tenancy

### Organization-Based Data Isolation

```
┌─────────────────────────────────────────────────────────┐
│                    Organization A                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────────┐  │
│  │ Admin   │  │ Agent 1 │  │ Agent 2 │  │Underwriter │  │
│  └─────────┘  └─────────┘  └─────────┘  └────────────┘  │
│                                                          │
│  Deals: Deal-001, Deal-002, Deal-003                    │
│  Properties: Isolated to this org                        │
│  Contacts: Isolated to this org                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Organization B                        │
│  ┌─────────┐  ┌─────────┐                               │
│  │ Admin   │  │ Agent 1 │                               │
│  └─────────┘  └─────────┘                               │
│                                                          │
│  Deals: Deal-001, Deal-002 (separate from Org A)        │
│  Properties: Isolated to this org                        │
└─────────────────────────────────────────────────────────┘
```

### RLS Policies

Every table with user data includes:

```sql
-- Read own organization's data
CREATE POLICY "Users can view own org data" ON deals
  FOR SELECT USING (
    organization_id = public.get_user_organization_id()
  );

-- Write to own organization only
CREATE POLICY "Users can insert to own org" ON deals
  FOR INSERT WITH CHECK (
    organization_id = public.get_user_organization_id()
  );
```

### Solo vs Team Accounts

- **Solo**: User creates "Personal Workspace" organization
- **Team**: Admin creates organization, invites team members

---

## Database Schema

### Core Tables

#### `organizations`

```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
slug            TEXT UNIQUE NOT NULL
owner_id        UUID REFERENCES profiles(id)
settings        JSONB DEFAULT '{}'
created_at      TIMESTAMPTZ
```

#### `profiles`

```sql
id              UUID PRIMARY KEY (matches auth.users.id)
email           TEXT NOT NULL
full_name       TEXT
role            TEXT DEFAULT 'agent'  -- admin, underwriter, agent, investor
organization_id UUID REFERENCES organizations(id)
phone           TEXT
avatar_url      TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `invitations`

```sql
id              UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
email           TEXT NOT NULL
role            TEXT DEFAULT 'agent'
invited_by      UUID REFERENCES profiles(id)
token           TEXT UNIQUE (for invite link)
status          TEXT DEFAULT 'pending'  -- pending, accepted, expired, cancelled
expires_at      TIMESTAMPTZ
created_at      TIMESTAMPTZ
```

### Deal Tables

#### `deals`

```sql
id              UUID PRIMARY KEY
deal_number     TEXT UNIQUE (e.g., "DEAL-2025-0001")
property_id     UUID REFERENCES properties(id)
agent_id        UUID REFERENCES profiles(id)
assigned_to     UUID REFERENCES profiles(id)
organization_id UUID REFERENCES organizations(id)
status          TEXT  -- submitted, in_review, approved, rejected, closed
asking_price    DECIMAL
offer_price     DECIMAL
submitted_at    TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `properties`

```sql
id              UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
address         TEXT NOT NULL
city            TEXT
state           TEXT
zip             TEXT
county          TEXT
property_type   TEXT  -- single_family, multi_family, commercial, land
bedrooms        INTEGER
bathrooms       DECIMAL
sqft            INTEGER
lot_size        DECIMAL
year_built      INTEGER
```

#### `underwriting_data`

```sql
id              UUID PRIMARY KEY
deal_id         UUID REFERENCES deals(id)
arv             DECIMAL  -- After Repair Value
repair_costs    DECIMAL
mao             DECIMAL  -- Maximum Allowable Offer
roi             DECIMAL
cap_rate        DECIMAL
cash_on_cash    DECIMAL
notes           TEXT
created_by      UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ
```

### Supporting Tables

#### `notifications`

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES profiles(id)
title           TEXT
message         TEXT
type            TEXT  -- deal_update, task, system
read            BOOLEAN DEFAULT false
deal_id         UUID REFERENCES deals(id)
created_at      TIMESTAMPTZ
```

#### `audit_logs`

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES profiles(id)
action          TEXT  -- create, update, delete, view
entity_type     TEXT  -- deal, user, settings
entity_id       UUID
old_values      JSONB
new_values      JSONB
ip_address      TEXT
created_at      TIMESTAMPTZ
```

#### `deal_comments`

```sql
id              UUID PRIMARY KEY
deal_id         UUID REFERENCES deals(id)
user_id         UUID REFERENCES profiles(id)
content         TEXT
created_at      TIMESTAMPTZ
```

---

## API Routes

### Deal Management

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/deals` | Create new deal | Agent+ |
| GET | `/api/deals/[id]` | Get deal details | Owner/Admin |
| PATCH | `/api/deals/[id]` | Update deal | Owner/Admin |
| DELETE | `/api/deals/[id]` | Delete deal | Admin |
| GET | `/api/deals/export` | Export deals to CSV | Admin |
| GET | `/api/deals/[id]/pdf` | Generate PDF offer | Agent+ |

### User Management

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/user/profile` | Get current user profile | User |
| PATCH | `/api/user/profile` | Update profile | User |
| GET | `/api/user/role` | Get user role | User |
| GET | `/api/user/organization` | Get org info | User |

### Team Management

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/team/invite` | Send invitation | Admin |
| GET | `/api/team/invitation?token=x` | Check invitation (public) | None |
| GET | `/api/team/members` | List team members | Admin |
| DELETE | `/api/team/invite/[id]` | Revoke invitation | Admin |

### Integrations

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/integrations/propstream` | Get ARV comps | Underwriter+ |
| POST | `/api/integrations/docusign/send` | Send for signature | Agent+ |
| GET | `/api/integrations/docusign/status` | Check envelope status | Agent+ |
| POST | `/api/integrations/drive-time` | Calculate drive time | Agent+ |
| GET | `/api/integrations/status` | Check all integrations | Admin |

### Cron Jobs (Scheduled)

| Method | Route | Schedule | Purpose |
|--------|-------|----------|---------|
| GET | `/api/cron/cleanup` | Daily 2 AM | Delete old rejected deals |
| GET | `/api/cron/weekly-report` | Monday 8 AM | Generate weekly stats |
| GET | `/api/cron/send-reminders` | Daily 9 AM | Remind about stale deals |

---

## Core Workflows

### Deal Submission Flow

```
┌──────────────┐
│    Agent     │
│  submits     │
│   deal       │
└──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ Validation   │────▶│ Save to DB   │
│ (Zod schema) │     │ Status:      │
└──────────────┘     │ "submitted"  │
                     └──────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
┌──────────────┐                        ┌──────────────┐
│ Notification │                        │  AI Scoring  │
│ to Underwriter                        │  (1-100)     │
└──────────────┘                        └──────────────┘
```

### Deal Analysis Flow

```
┌──────────────┐
│ Underwriter  │
│ opens deal   │
└──────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│           Analysis Tools                 │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │   ARV   │  │   MAO   │  │   ROI   │  │
│  │  Calc   │  │  Calc   │  │  Calc   │  │
│  └─────────┘  └─────────┘  └─────────┘  │
└─────────────────────────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ Save Results │────▶│ Update Status│
│ to underwriting_data│ "in_review" │
└──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│ Approve or   │
│ Reject       │
└──────────────┘
```

### Team Invitation Flow

```
┌──────────────┐
│   Admin      │
│ sends invite │
└──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ Create       │────▶│ Send Email   │
│ invitation   │     │ via Resend   │
│ record       │     └──────────────┘
└──────────────┘            │
                            ▼
                    ┌──────────────┐
                    │ User clicks  │
                    │ invite link  │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ /login?      │
                    │ invite=token │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ User signs   │
                    │ up           │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ /auth/       │
                    │ callback     │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Process      │
                    │ invitation   │
                    │ Join org     │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ /dashboard   │
                    │ (skip onboard)
                    └──────────────┘
```

---

## UI Components

### Layout Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Sidebar` | `components/layout/sidebar.tsx` | Desktop navigation with role-based items |
| `MobileSidebar` | `components/layout/mobile-sidebar.tsx` | Mobile hamburger menu |
| `Topbar` | `components/layout/topbar.tsx` | Header with user menu, notifications |
| `PremiumHeader` | `components/layout/premium-header.tsx` | Animated page headers |

### Premium UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PremiumCard` | `components/ui/premium-card.tsx` | Glassmorphism card with gradient border |
| `PremiumBadge` | `components/ui/premium-badge.tsx` | Status badges with animations |
| `PremiumSkeleton` | `components/ui/premium-skeleton.tsx` | Loading skeletons |

### Deal Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `DealDetailClient` | `components/deals/deal-detail-client.tsx` | Full deal view with tabs |
| `DealsPageClient` | `components/deals/deals-page-client.tsx` | Deal list with filters |
| `DealScoreDisplay` | `components/deals/deal-score-display.tsx` | AI score visualization |
| `Comments` | `components/deals/comments.tsx` | Deal comment thread |
| `AssignDeal` | `components/deals/assign-deal.tsx` | Assign to underwriter |

---

## Integrations

### PropStream (Comps Data)

**Status**: Mock (requires ~$97/month subscription)

```typescript
// lib/integrations/propstream.ts
export async function getARVEstimate(property: PropertyData): Promise<ARVResult> {
  if (isPropStreamConfigured()) {
    // Real API call
    return await fetchFromPropStream(property);
  }
  // Return mock data for development
  return getMockARVEstimate(property);
}
```

### DocuSign (E-Signatures)

**Status**: Mock (requires developer account)

```typescript
// lib/integrations/docusign.ts
export async function createOfferEnvelope(deal: Deal, recipient: Recipient): Promise<EnvelopeResult> {
  if (isDocuSignConfigured()) {
    // Real API call
    return await sendToDocuSign(deal, recipient);
  }
  // Return mock envelope ID
  return getMockEnvelopeResponse();
}
```

### Google Maps (Drive Time)

**Status**: ✅ Configured

```typescript
// lib/integrations/google-maps.ts
export async function calculateDriveTime(origin: string, destination: string): Promise<DriveTimeResult> {
  if (isGoogleMapsConfigured()) {
    // Real API call to Distance Matrix API
    return await fetchDriveTime(origin, destination);
  }
  return getMockDriveTimeResult();
}
```

### Resend (Email)

**Status**: ✅ Configured

```typescript
// lib/email.ts
export async function sendInvitationEmail(params: InviteEmailParams): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: params.to,
    subject: `You're invited to join ${params.organizationName}`,
    html: getInvitationEmailTemplate(params),
  });
  
  return true;
}
```

---

## Scheduled Jobs

### Daily Cleanup (`/api/cron/cleanup`)

**Schedule**: Daily at 2:00 AM

**Actions**:

1. Delete rejected deals older than 30 days
2. Archive closed deals older than 90 days
3. Clean up orphaned records

### Weekly Report (`/api/cron/weekly-report`)

**Schedule**: Monday at 8:00 AM

**Actions**:

1. Calculate pipeline statistics
2. Generate deal velocity metrics
3. Send summary to admins

### Daily Reminders (`/api/cron/send-reminders`)

**Schedule**: Daily at 9:00 AM

**Actions**:

1. Find deals in_review for 3+ days
2. Send reminder email to assigned underwriter
3. Notify admin of stale deals

### Setup with cron-job.org

```
URL: https://your-domain.vercel.app/api/cron/cleanup
Authorization: Bearer YOUR_CRON_SECRET
Schedule: 0 2 * * * (daily 2 AM)
```

---

## Environment Variables

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For bypassing RLS

# Required - Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com

# Optional - Integrations
GOOGLE_MAPS_API_KEY=AIza...
PROPSTREAM_API_KEY=xxx  # Paid service
DOCUSIGN_INTEGRATION_KEY=xxx  # Requires account

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DealFlow
CRON_SECRET=xxx  # For cron job authentication
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Database Migrations

Run in Supabase SQL Editor in order:

1. `003_notifications.sql`
2. `004_audit_logs.sql`
3. `005_full_platform.sql`
4. `20250119_deal_comments.sql`
5. `20250120_task_assignment.sql`
6. `20250600_pre_multi_tenancy_data_migration.sql`
7. `20250601_multi_tenancy.sql`
8. `20250602_multi_tenancy_sync.sql`
9. `20250603_invitation_system.sql`
10. `20250604_fix_invitation_access.sql`
11. `20251213_email_sequences.sql`

---

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Key Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

---

*Last updated: January 2026*
