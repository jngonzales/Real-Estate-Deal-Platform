# 🏠 DealFlow - Enterprise Real Estate Deal Management Platform

A **premium, full-featured SaaS platform** for real estate investors, wholesalers, and investment firms to manage deals, perform sophisticated underwriting analysis, automate workflows, and scale operations.

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-ff69b4?style=flat-square&logo=framer)

## 🚀 Live Demo

**[https://real-estate-deal-platform.vercel.app](https://real-estate-deal-platform.vercel.app)**

> **Note**: This is a production-grade platform with enterprise features, premium UI/UX, and automated workflows.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Premium UI/UX](#-premium-uiux)
- [Automated Systems](#-automated-systems)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 🎯 Deal Management System
- **Smart Deal Submission** - Comprehensive form with validation, property details, seller info, and multi-file uploads
- **Interactive Pipeline** - Visual Kanban board with drag-and-drop status updates across 9 deal stages
- **Deal Timeline** - Complete activity history with timestamps for every action
- **Bulk Operations** - Export to CSV, bulk status updates, mass assignments, and batch actions
- **Advanced Search** - Filter by status, agent, date range, property type, and location
- **Deal Comments** - Threaded discussions on each deal with @mentions and notifications

### 📊 Underwriting & Financial Analysis
- **ARV Calculator** - After Repair Value estimation with PropStream integration for real comps
- **Intelligent Repair Estimator** - Automatic cost calculations based on property condition and scope
- **MAO Calculator** - Maximum Allowable Offer using configurable formulas (70% rule, wholesale spread)
- **Profit Projections** - ROI analysis, holding costs, closing costs, and net profit calculations
- **Deal Scoring** - Automated deal quality scoring based on multiple metrics
- **Comparative Analysis** - Side-by-side deal comparisons

### 💼 Investor Portal
- **Dedicated Dashboard** - Clean, focused interface for investors to browse opportunities
- **Smart Filtering** - Filter by property type, location, price range, ARV, and potential profit
- **Funding Requests** - Submit and track funding applications with document uploads
- **Investment History** - View all past investments and performance metrics
- **Deal Alerts** - Email notifications for new deals matching investment criteria

### 👥 Team Collaboration
- **Role-Based Access Control** - 4 roles (Agent, Underwriter, Admin, Investor) with granular permissions
- **Smart Assignment** - Assign deals to team members with workload balancing
- **Real-time Notifications** - Bell notifications for status changes, assignments, and comments
- **Task Management** - Create and assign tasks with due dates and priorities
- **Team Activity Feed** - Live feed of all team actions and updates
- **Email Sequences** - Automated follow-up sequences for deals and communications

### 🔧 Admin & Management
- **User Management** - Full CRUD for team members with role assignment
- **Analytics Dashboard** - Interactive charts, conversion metrics, and pipeline analysis
- **Audit Logs** - Complete system history with user tracking and action logs
- **Funding Queue** - Manage and approve investor funding requests
- **System Settings** - Configure underwriting rules, email templates, and integrations
- **Performance Metrics** - Agent performance tracking and deal velocity analytics

### 📄 Document Management
- **PDF Generation** - Professional offer letters with company branding
- **Photo Gallery** - Upload, organize, and view property photos
- **Document Storage** - Secure file management with Supabase Storage
- **Document Templates** - Customizable templates for offers, contracts, and reports
- **Version Control** - Track document revisions and changes

### 🔗 Integrations
- **PropStream** - Real estate data, comps, and property details
- **Resend** - Transactional emails, notifications, and sequences
- **Supabase Storage** - Secure file storage and CDN
- **Vercel** - Enterprise hosting with edge functions

---

## 🎨 Premium UI/UX

### Design System
Our platform features an **enterprise-grade design system** that rivals platforms like Stripe, Linear, and Vercel:

- **Glass Morphism** - Frosted glass effects with backdrop blur for depth
- **Gradient Overlays** - Smooth linear gradients for visual hierarchy
- **Micro-Interactions** - Hover effects, scale transforms, and smooth transitions
- **Animated Orbs** - Floating background elements with blur effects
- **Premium Badges** - 8 color variants with pulse animations
- **Shimmer Loading** - Elegant skeleton loaders with animation
- **Premium Scrollbars** - Custom-styled scrollbars for consistency
- **Dark Mode** - Full dark mode support with adaptive colors

### Component Library
- **PremiumHeader** - Animated header with live stats and trend indicators
- **PremiumCard** - Glass morphism cards with gradient backgrounds
- **PremiumButton** - Gradient buttons with shine effects
- **PremiumBadge** - Status badges with 8 variants and pulse option
- **PremiumSkeleton** - Loading states with shimmer animation
- **Interactive Charts** - Recharts with custom styling and animations

### Visual Features
- **Live Stats** - Real-time pipeline value, active deals, and closed count
- **Trend Indicators** - Growth percentages with up/down arrows
- **Status Pulse** - Animated pulse indicators for active deals
- **Gradient Hover Effects** - Smooth transitions on card hover
- **Enhanced Empty States** - Beautiful placeholders with CTAs
- **Quick Tips Cards** - Color-coded onboarding with floating orbs

---

## 🤖 Automated Systems

### Cron Jobs (External Service: cron-job.org)
Our platform includes **3 automated maintenance tasks** that run on schedules:

#### 🧹 Daily Cleanup (2:00 AM)
- **Purpose**: Database optimization and maintenance
- **Actions**: 
  - Deletes rejected deals older than 90 days
  - Prevents database bloat
  - Improves query performance
- **Impact**: Keeps system fast and efficient

#### 📊 Weekly Report (Monday 9:00 AM)
- **Purpose**: Executive pipeline overview
- **Actions**:
  - Calculates deals from last 7 days
  - Computes total pipeline value
  - Breaks down deals by status
  - Ready for email integration
- **Impact**: Automated insights without manual reporting

#### 🔔 Daily Reminders (10:00 AM)
- **Purpose**: Deal follow-up automation
- **Actions**:
  - Finds deals in "needs_info" or "underwriting" for 3+ days
  - Sends email reminders to agents via Resend
  - Includes deal details and action links
  - Tracks reminder count
- **Impact**: Never let deals go stale, improve conversion rates

### Security
All cron jobs are secured with **Bearer token authentication** using the `CRON_SECRET` environment variable.

**Setup Guide**: See [CRON_JOBS_SETUP.md](./CRON_JOBS_SETUP.md) for detailed configuration instructions.

---

## 🛠 Tech Stack

### Core Technologies

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16.0.10 (App Router) | Server-side rendering, API routes, file-based routing |
| **Frontend** | React 19, TypeScript | Type-safe component architecture |
| **Styling** | Tailwind CSS 4, Radix UI | Utility-first CSS with accessible components |
| **Animations** | Framer Motion 11.18.0 | Smooth animations and micro-interactions |
| **Database** | Supabase (PostgreSQL) | Real-time database with row-level security |
| **Authentication** | Supabase Auth | Email/password auth with role management |
| **File Storage** | Supabase Storage | Secure file uploads with CDN |
| **Charts** | Recharts | Interactive data visualizations |
| **PDF Generation** | @react-pdf/renderer | Professional document generation |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Email** | Resend API | Transactional emails and sequences |
| **Deployment** | Vercel | Edge functions and global CDN |
| **Cron Jobs** | cron-job.org | Scheduled tasks and automation |

### Key Libraries

- **shadcn/ui** - Premium component library built on Radix UI
- **lucide-react** - Beautiful icon system
- **date-fns** - Date manipulation and formatting
- **recharts** - Chart library for analytics
- **clsx** + **tailwind-merge** - Conditional class merging
- **react-hook-form** - Performant form management
- **zod** - TypeScript-first schema validation

---

## 🏗 Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  - Server Components (RSC) for data fetching               │
│  - Client Components for interactivity                     │
│  - Premium UI components with animations                   │
│  - Form validation and error handling                      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  - /api/deals/* - Deal operations                          │
│  - /api/cron/* - Automated tasks (cleanup, reports)        │
│  - /api/user/* - User management                           │
│  - /api/integrations/* - PropStream, Resend                │
│  - /api/debug/* - Development utilities                    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│  - PostgreSQL with row-level security (RLS)                │
│  - Real-time subscriptions                                 │
│  - Automated backups and scaling                           │
│  - Storage buckets for files                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
├─────────────────────────────────────────────────────────────┤
│  - PropStream (comps data)                                 │
│  - Resend (email delivery)                                 │
│  - cron-job.org (scheduled tasks)                          │
│  - Vercel Analytics                                        │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema Overview

**Core Tables**:
- `profiles` - User accounts with roles and metadata
- `deals` - Main deal records with status tracking
- `properties` - Property details and specifications
- `underwriting_data` - Financial analysis and calculations
- `notifications` - In-app notifications system
- `audit_logs` - Complete action history
- `email_sequences` - Automated email campaigns
- `tasks` - Task management and assignments
- `deal_comments` - Threaded comments on deals
- `funding_requests` - Investor funding applications

**Row-Level Security**: All tables implement RLS policies based on user roles.

---

## � Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Resend API key ([resend.com](https://resend.com))
- PropStream account (optional, for comps data)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jngonzales/Real-Estate-Deal-Platform.git
   cd real-estate-deal-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Resend (Email)
   RESEND_API_KEY=your_resend_api_key
   
   # PropStream (optional)
   PROPSTREAM_API_KEY=your_propstream_key
   
   # Cron Jobs Security
   CRON_SECRET=your_generated_secret
   ```

4. **Run database migrations**
   
   Apply all migrations in the `supabase/migrations/` folder through the Supabase dashboard or CLI.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create Admin User**
   - Sign up through the login page
   - Manually set role to 'admin' in Supabase dashboard:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
     ```

2. **Configure Cron Jobs**
   - Follow [CRON_JOBS_SETUP.md](./CRON_JOBS_SETUP.md)
   - Set up 3 cron jobs on cron-job.org

3. **Test Features**
   - Submit a test deal
   - Run underwriting analysis
   - Generate PDF offer
   - Test notifications

---

## �📁 Project Structure

```
real-estate-deal-platform/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/                    # Automated tasks
│   │   │   │   ├── cleanup/             # Daily cleanup route
│   │   │   │   ├── weekly-report/       # Weekly stats route
│   │   │   │   └── send-reminders/      # Daily reminders route
│   │   │   ├── deals/                   # Deal operations
│   │   │   │   ├── export/              # CSV export
│   │   │   │   ├── pdf/                 # PDF generation
│   │   │   │   └── [id]/                # Deal-specific endpoints
│   │   │   ├── integrations/            # External APIs
│   │   │   │   ├── propstream/          # PropStream integration
│   │   │   │   └── resend/              # Email service
│   │   │   ├── user/                    # User management
│   │   │   └── debug/                   # Development tools
│   │   ├── auth/
│   │   │   ├── callback/                # OAuth callback
│   │   │   └── update-password/         # Password reset
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Main dashboard
│   │   │   ├── admin/                   # Admin-only pages
│   │   │   │   ├── users/               # User management
│   │   │   │   ├── funding/             # Funding queue
│   │   │   │   └── audit-logs/          # System logs
│   │   │   ├── analytics/               # Analytics dashboard
│   │   │   ├── deals/                   # Deal management
│   │   │   │   ├── page.tsx             # Deal list
│   │   │   │   └── [id]/                # Deal details, underwriting
│   │   │   ├── investor/                # Investor portal
│   │   │   ├── notifications/           # Notification center
│   │   │   ├── settings/                # User settings
│   │   │   └── submit/                  # Deal submission form
│   │   ├── login/                       # Login page
│   │   ├── offline/                     # PWA offline page
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Premium CSS system
│   ├── components/
│   │   ├── layout/
│   │   │   ├── premium-header.tsx       # Animated header
│   │   │   ├── navbar.tsx               # Main navigation
│   │   │   └── sidebar.tsx              # Admin sidebar
│   │   ├── ui/                          # Premium UI components
│   │   │   ├── premium-card.tsx         # Glass morphism cards
│   │   │   ├── premium-button.tsx       # Gradient buttons
│   │   │   ├── premium-badge.tsx        # Status badges
│   │   │   ├── premium-skeleton.tsx     # Loading states
│   │   │   └── ...shadcn components     # Base UI components
│   │   ├── deals/                       # Deal-specific components
│   │   ├── dashboard/                   # Dashboard components
│   │   ├── analytics/                   # Chart components
│   │   ├── notifications/               # Notification UI
│   │   └── pdf/                         # PDF templates
│   ├── lib/
│   │   ├── actions/                     # Server actions
│   │   ├── schemas/                     # Zod validation schemas
│   │   ├── formulas/                    # Underwriting formulas
│   │   ├── integrations/                # API integrations
│   │   └── utils.ts                     # Utility functions
│   └── utils/
│       ├── supabase/                    # Supabase clients
│       └── email/                       # Email templates
├── supabase/
│   ├── migrations/                      # Database migrations
│   └── seed.sql                         # Sample data
```

---

## 🔌 API Routes

### Deal Management
- `POST /api/deals` - Create new deal
- `GET /api/deals/[id]` - Get deal details
- `PATCH /api/deals/[id]` - Update deal
- `DELETE /api/deals/[id]` - Delete deal
- `POST /api/deals/export` - Export deals to CSV
- `POST /api/deals/pdf` - Generate PDF offer

### Cron Jobs (Automated Tasks)
- `POST /api/cron/cleanup` - Daily cleanup of old rejected deals
- `POST /api/cron/weekly-report` - Generate weekly pipeline statistics
- `POST /api/cron/send-reminders` - Send reminder emails for stale deals

### User Management
- `GET /api/user/profile` - Get current user profile
- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/role` - Get user role and permissions

### Integrations
- `POST /api/integrations/propstream/comps` - Fetch comparable properties
- `POST /api/integrations/resend/send` - Send email via Resend

### Debug (Development Only)
- `GET /api/debug/env` - Check environment variables
- `GET /api/debug/supabase` - Test Supabase connection

---

## 🗄 Database Schema

### Core Tables

**profiles**
- User accounts with roles (agent, underwriter, admin, investor)
- Full name, email, avatar, active status
- Created and updated timestamps

**properties**
- Property details (address, city, state, zip)
- Specifications (beds, baths, sqft, lot size, year built)
- Property type and condition
- Created by user reference

**deals**
- Deal pipeline records with 9 status stages
- Asking price, seller information
- Agent assignment and timestamps
- Foreign keys to property and agent

**underwriting_data**
- ARV (After Repair Value) calculations
- Repair estimates and detailed scope
- Maximum Allowable Offer (MAO)
- Profit projections and ROI

**notifications**
- In-app notification system
- Type (deal_update, assignment, comment, etc.)
- Read/unread status
- User and deal references

**audit_logs**
- Complete system action history
- User, action type, entity affected
- Before/after state changes
- IP address and user agent tracking

**email_sequences**
- Automated email campaigns
- Trigger conditions and delay settings
- Template content with variables
- Active/inactive status

**tasks**
- Task management system
- Assignee and due dates
- Priority levels (low, medium, high)
- Completion status

**deal_comments**
- Threaded comments on deals
- Author and timestamp
- Edit history

**funding_requests**
- Investor funding applications
- Amount requested and status
- Document attachments
- Approval workflow

### Row Level Security (RLS)

All tables implement PostgreSQL Row-Level Security:

- **Agents**: See only their own deals and related data
- **Underwriters**: View all deals, edit underwriting data
- **Admins**: Full access to all data and users
- **Investors**: View approved deals marked for investor portal

---

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxx

# PropStream Integration (Optional)
PROPSTREAM_API_KEY=your_propstream_key

# Cron Job Security
CRON_SECRET=generate_with_crypto_randomBytes_32_hex

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generating CRON_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Add environment variables
   - Click "Deploy"

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Set for Production, Preview, and Development
   - Redeploy after adding variables

4. **Set Up Cron Jobs**
   - Follow [CRON_JOBS_SETUP.md](./CRON_JOBS_SETUP.md)
   - Use cron-job.org (free) instead of Vercel Cron (requires Pro plan)
   - Configure 3 jobs with Bearer token authentication

### Database Migrations

Run all migrations in order through Supabase SQL Editor:

1. `003_notifications.sql`
2. `004_audit_logs.sql`
3. `005_full_platform.sql`
4. `20250119_deal_comments.sql`
5. `20250120_task_assignment.sql`
6. `20251213_email_sequences.sql`
7. `fix_missing_tables.sql`

---

## 📊 Key Metrics & Features

### Platform Statistics
- **30+ Pages** - Complete enterprise SaaS application
- **100+ Components** - Reusable, type-safe React components
- **4 User Roles** - Agent, Underwriter, Admin, Investor with granular permissions
- **9 Deal Stages** - Comprehensive pipeline management
- **3 Automated Jobs** - Scheduled tasks for maintenance and notifications
- **Full CRUD** - Complete operations for all entities
- **RLS Security** - Row-level security on all tables
- **Responsive Design** - Works seamlessly on desktop, tablet, mobile

### Performance
- **Server Components** - Fast initial page loads with RSC
- **Parallel Queries** - Optimized data fetching with Promise.all
- **Edge Functions** - Global CDN with Vercel
- **Real-time Updates** - Supabase subscriptions (optional)

### User Experience
- **Premium UI** - Glass morphism, gradients, animations
- **Micro-interactions** - Hover effects, smooth transitions
- **Loading States** - Skeleton loaders with shimmer
- **Empty States** - Beautiful placeholders with CTAs
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback

---

## 🤝 Contributing

This is a commercial project, but contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript** - All code must be type-safe
- **ESLint** - Follow linting rules
- **Prettier** - Format code before committing
- **Component Structure** - Use Server Components by default
- **Naming** - Use kebab-case for files, PascalCase for components

---

## 📄 License

© 2025 DealFlow Platform. All rights reserved.

This is a commercial project. For licensing inquiries, please contact the author.

---

## 🤝 Support & Contact

- **GitHub Issues**: [Report bugs](https://github.com/jngonzales/Real-Estate-Deal-Platform/issues)
- **Reddit**: u/jngonzales
- **Email**: Contact via GitHub profile

---

## 🎯 Roadmap

### Q1 2025
- [ ] Mobile apps (iOS/Android with React Native)
- [ ] Advanced analytics with AI insights
- [ ] Zillow/Redfin integration
- [ ] SMS notifications via Twilio

### Q2 2025
- [ ] DocuSign integration for e-signatures
- [ ] Marketplace for connecting with investors
- [ ] Custom branding for white-label
- [ ] Multi-language support

### Q3 2025
- [ ] AI-powered deal scoring
- [ ] Predictive analytics for ARV
- [ ] Automated comps analysis
- [ ] Mobile offline mode

---

## 🙏 Acknowledgments

Built with incredible tools:
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a service
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion) - Animations
- [Recharts](https://recharts.org) - Charts
- [Vercel](https://vercel.com) - Hosting

---

<div align="center">

**Built with ❤️ for real estate investors**

[⬆ Back to Top](#-dealflow---enterprise-real-estate-deal-management-platform)

</div>
