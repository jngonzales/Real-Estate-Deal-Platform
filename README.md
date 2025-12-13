# DealFlow - Real Estate Deal Management Platform

A modern, full-featured SaaS platform for real estate investors and wholesalers to manage deals, perform underwriting analysis, and collaborate with their teams.

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## 🏠 Live Demo

**[https://real-estate-deal-platform.vercel.app](https://real-estate-deal-platform.vercel.app)**

## ✨ Features

### Deal Management
- **Submit Deals** - Easy-to-use form with property details, seller info, and file uploads
- **Deal Pipeline** - Visual Kanban board with drag-and-drop status updates
- **Deal Timeline** - Complete activity history for every deal
- **Bulk Actions** - Export deals to CSV, bulk status updates, bulk assignments

### Underwriting & Analysis
- **ARV Calculator** - After Repair Value estimation with PropStream comps integration
- **Repair Estimator** - Automatic repair cost calculations based on scope
- **MAO Calculator** - Maximum Allowable Offer using 70% rule and custom formulas
- **Profit Analysis** - ROI, holding costs, and profit projections

### Investor Portal
- **Dedicated Dashboard** - Clean interface for investors to browse available deals
- **Deal Filtering** - Filter by property type, location, price range
- **Funding Requests** - Submit and track funding requests with document uploads

### Team Collaboration
- **Role-Based Access** - Agent, Underwriter, Admin, and Investor roles
- **Deal Assignment** - Assign deals to team members
- **Comments & Notes** - Discuss deals with your team
- **Real-time Notifications** - Bell notifications for status changes and assignments

### Admin Features
- **User Management** - Create, edit, and manage team members
- **Analytics Dashboard** - Charts and metrics for deal flow analysis
- **Audit Logs** - Complete history of all system actions
- **Funding Queue** - Manage and approve funding requests

### Document Generation
- **PDF Offers** - Generate professional offer PDFs with company branding
- **Photo Attachments** - Upload and manage property photos
- **File Management** - Secure file storage with Supabase Storage

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.0.10 (App Router) |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Radix UI |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **Charts** | Recharts |
| **PDF Generation** | @react-pdf/renderer |
| **Forms** | React Hook Form + Zod validation |
| **Deployment** | Vercel |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes (PDF generation, exports)
│   ├── auth/             # Auth callback routes
│   ├── dashboard/
│   │   ├── admin/        # Admin pages (users, funding, audit logs)
│   │   ├── analytics/    # Analytics dashboard
│   │   ├── deals/        # Deal list and detail pages
│   │   ├── investor/     # Investor portal
│   │   ├── notifications/# Notifications page
│   │   ├── settings/     # User settings
│   │   └── submit/       # Submit new deal
│   └── login/            # Login page
├── components/
│   ├── deals/            # Deal-related components
│   ├── layout/           # Sidebar, Topbar, Navigation
│   ├── notifications/    # Notification components
│   ├── pdf/              # PDF templates
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── underwriting/     # Underwriting calculator components
├── lib/
│   ├── actions/          # Server actions (deals, users, notifications)
│   └── schemas/          # Zod validation schemas
└── utils/
    └── supabase/         # Supabase client utilities
```

## 🗄 Database Schema

### Core Tables
- **profiles** - User profiles with roles (agent, underwriter, admin, investor)
- **properties** - Property details (address, beds, baths, sqft, etc.)
- **deals** - Deal records with status, pricing, and assignments
- **underwriting_records** - ARV, repair estimates, max offer calculations
- **attachments** - File uploads linked to deals
- **comments** - Deal comments and discussions
- **notifications** - User notifications
- **audit_logs** - System audit trail

### Row Level Security (RLS)
All tables implement RLS policies for secure multi-tenant access:
- Agents see only their own deals
- Underwriters/Admins see all deals
- Investors see only approved deals marked for investor viewing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jngonzales/Real-Estate-Deal-Platform.git
   cd Real-Estate-Deal-Platform/real-estate-deal-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   
   Execute the SQL in `supabase/migrations/fix_missing_tables.sql` in your Supabase SQL Editor.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📊 Key Metrics & Stats

- **10+ Pages** - Complete SaaS application
- **50+ Components** - Reusable React components
- **4 User Roles** - Agent, Underwriter, Admin, Investor
- **Full CRUD** - Create, read, update, delete for all entities
- **RLS Security** - Row-level security on all database tables
- **Responsive** - Works on desktop, tablet, and mobile

## 🎨 Screenshots

*Dashboard with deal overview and analytics*

*Underwriting calculator with ARV and MAO calculations*

*Professional PDF offer generation*

## 📄 License

This project is available for purchase. Contact for licensing details.

## 🤝 Contact

For inquiries about purchasing this codebase, please reach out via Reddit or GitHub.

---

Built with ❤️ using Next.js and Supabase
