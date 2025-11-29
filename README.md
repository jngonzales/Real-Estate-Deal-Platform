# DealFlow - Real Estate Deal Management Platform

A comprehensive real estate deal management platform built for wholesalers, flippers, and investors to streamline their deal pipeline from submission to closing.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)

## 🏠 Features

- **Deal Submission** - Submit property deals with comprehensive details including seller info, property type, and file attachments
- **Underwriting Engine** - Calculate ARV, MAO, and profit projections with customizable parameters
- **Pipeline Management** - Track deals through stages: Submitted → Underwriting → Approved → Closed
- **Dual View Modes** - Switch between List and Kanban board views
- **Dark/Light Theme** - Toggle between dark and light modes with system preference support
- **User Settings** - Customize underwriting defaults and notification preferences
- **Role-Based Access** - Support for agents, underwriters, and admin roles
- **File Attachments** - Upload contracts, photos, and documents to Supabase Storage

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (free tier works)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Real-Estate-Deal-Platform.git
cd Real-Estate-Deal-Platform/real-estate-deal-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the database migrations in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'underwriter', 'admin')),
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  sqft INTEGER,
  lot_size NUMERIC,
  year_built INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'underwriting', 'approved', 'rejected', 'closed')),
  asking_price NUMERIC NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT,
  seller_email TEXT,
  seller_motivation TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create underwriting_analyses table
CREATE TABLE underwriting_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  underwriter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  arv NUMERIC NOT NULL,
  repair_costs NUMERIC NOT NULL,
  mao NUMERIC NOT NULL,
  offer_price NUMERIC,
  projected_profit NUMERIC,
  holding_costs NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  target_profit_percent NUMERIC DEFAULT 20,
  holding_period_months INTEGER DEFAULT 6,
  monthly_holding_cost NUMERIC DEFAULT 1500,
  selling_costs_percent NUMERIC DEFAULT 8,
  notify_deal_status BOOLEAN DEFAULT true,
  notify_underwriting_complete BOOLEAN DEFAULT true,
  notify_weekly_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE underwriting_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for deals (agents see their own, underwriters/admins see all)
CREATE POLICY "Agents can view own deals" ON deals FOR SELECT USING (
  auth.uid() = agent_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);
CREATE POLICY "Agents can insert deals" ON deals FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Users can update deals" ON deals FOR UPDATE USING (
  auth.uid() = agent_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);

-- RLS Policies for properties
CREATE POLICY "Users can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Users can insert properties" ON properties FOR INSERT WITH CHECK (true);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for underwriting_analyses
CREATE POLICY "Users can view analyses" ON underwriting_analyses FOR SELECT USING (true);
CREATE POLICY "Underwriters can insert analyses" ON underwriting_analyses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments" ON attachments FOR SELECT USING (true);
CREATE POLICY "Users can upload attachments" ON attachments FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Create a Storage bucket named `attachments` in Supabase Storage (Storage → New bucket)

4. Configure Authentication:
   - Go to **Authentication → URL Configuration**
   - Set **Site URL** to your deployment URL (e.g., `https://your-app.vercel.app`)
   - Add redirect URLs for local development: `http://localhost:3000/**`

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL (update for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can find your Supabase credentials in:
- **Project Settings → API → Project URL**
- **Project Settings → API → anon/public key**

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── deals/          # Deal list and detail pages
│   │   ├── settings/       # User settings page
│   │   └── submit/         # Deal submission form
│   ├── login/              # Authentication page
│   └── layout.tsx          # Root layout with providers
├── components/
│   ├── deals/              # Deal-related components
│   ├── layout/             # Sidebar, topbar, etc.
│   ├── providers/          # Context providers (theme)
│   ├── settings/           # Settings page components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── actions/            # Server actions
│   └── utils.ts            # Utility functions
└── utils/
    └── supabase/           # Supabase client setup
```

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel deployment URL)
5. Click **Deploy**

### 3. Post-Deployment Setup

Update your Supabase Auth settings:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
3. Add the Vercel URL to **Redirect URLs**: `https://your-app.vercel.app/**`

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎨 Customization

### Theme Colors

Edit the CSS variables in `src/app/globals.css` to customize the color scheme. The app uses a slate-based theme with CSS variables for automatic dark mode support.

### Underwriting Defaults

Users can customize their default underwriting parameters in Settings:
- Target Profit %
- Holding Period (months)
- Monthly Holding Cost
- Selling Costs (% of ARV)

## 🐛 Troubleshooting

### "Database error saving new user"
Make sure you've created the `handle_new_user` trigger in Supabase to automatically create profile records.

### "Failed to fetch deals"
Check that Row Level Security (RLS) policies are set up correctly and the user has a profile record.

### Dark mode text not visible
The app uses CSS variables (`text-foreground`, `text-muted-foreground`) that automatically adapt to the theme.

## 📄 License

This project is private and proprietary.

## 👤 Author

**JN Gonzales**

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS
