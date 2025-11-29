# Real Estate Deal Platform

A comprehensive real estate deal management platform built with Next.js 16, Supabase, and Tailwind CSS.

## Features

### 🏠 Deal Management
- **Multi-step Deal Submission** - Property details, seller info, and photo uploads
- **Deal List & Kanban Board** - Toggle between table and drag-and-drop views
- **Status Tracking** - Track deals through Submitted → Underwriting → Approved → Closed

### 📊 Underwriting Module
- **MAO Calculator** - Maximum Allowable Offer based on your profit targets
- **70% Rule** - Quick flip analysis formula
- **Repair Estimates** - Auto-calculate by scope (cosmetic to gut rehab)
- **Profit Analysis** - ROI, profit margin, and total investment breakdown

### 🔐 Authentication
- **Supabase Auth** - Secure email/password authentication
- **Protected Routes** - Middleware-based route protection
- **Row Level Security** - Users only see their own deals

### 📱 Modern UI
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Shadcn/UI Components** - Beautiful, accessible UI components
- **Tailwind CSS v4** - Latest styling with Oxide engine

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with SSR
- **Styling**: Tailwind CSS v4 + Shadcn/UI
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd real-estate-deal-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Go to Settings → API and copy your URL and anon key

4. **Configure environment variables**
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

Run these SQL scripts in your Supabase SQL Editor:

1. **Schema** (`supabase/schema.sql`) - Creates tables and RLS policies
2. **Seed Data** (`supabase/seed.sql`) - Adds sample deals (optional)
3. **Storage Bucket** - Run this to enable photo uploads:
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('deal-attachments', 'deal-attachments', true);
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── deals/          # Deals list and detail pages
│   │   ├── submit/         # Deal submission form
│   │   └── settings/       # User settings
│   └── login/              # Auth pages
├── components/
│   ├── deals/              # Deal-related components
│   ├── layout/             # Sidebar, topbar, etc.
│   └── ui/                 # Shadcn/UI components
├── lib/
│   ├── actions/            # Server Actions
│   └── schemas/            # Zod validation schemas
└── utils/
    └── supabase/           # Supabase client helpers
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repo to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## License

MIT License
