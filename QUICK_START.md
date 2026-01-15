# 🚀 DealFlow Quick Start Guide

Get DealFlow running in 5 minutes.

---

## Prerequisites

- Node.js 18.17+
- Supabase account (free): https://supabase.com
- API Keys (all free):
  - Gemini: https://makersuite.google.com/app/apikey
  - Geoapify: https://www.geoapify.com
  - Resend: https://resend.com

---

## 1. Clone & Install (1 min)

```bash
git clone https://github.com/yourusername/dealflow.git
cd dealflow
npm install
```

---

## 2. Configure Environment (2 min)

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Integrations (FREE)
GOOGLE_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_GEOAPIFY_KEY=your_geoapify_key
RESEND_API_KEY=your_resend_key

# Admin Access
ADMIN_EMAIL=your@email.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DealFlow
```

---

## 3. Setup Database (1 min)

Run in Supabase SQL Editor:

```sql
-- Run these files in order from supabase/migrations/:
-- 1. 005_full_platform.sql
-- 2. 20260108_user_profiles.sql
```

---

## 4. Run Development Server (30 sec)

```bash
npm run dev
```

Open http://localhost:3000

---

## 5. Verify Setup (30 sec)

1. Login with your email
2. Go to http://localhost:3000/admin/status
3. Check all services show green ✅

---

## Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Main deal management |
| Calculators | `/calculators` | Financial calculators |
| Status | `/admin/status` | System health (admin only) |

---

## Deployment

```bash
# Deploy to Vercel (free)
npm i -g vercel
vercel
```

---

## Need Help?

- Full docs: See `PROJECT_DOCUMENTATION.md`
- Detailed README: See `README.md`

---

**Total Cost: $0/month** 🎉
