# DealFlow

<p align="center">
  <img src="public/icons/icon-192x192.png" alt="DealFlow Logo" width="120" height="120">
</p>

<p align="center">
  <strong>The Smart Real Estate Investment Analysis Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#environment-variables">Environment Variables</a>
</p>

---

## Overview

DealFlow is a comprehensive real estate investment platform designed for wholesalers, investors, and underwriting teams. It combines powerful analysis tools with team collaboration features to help you evaluate deals faster and make smarter investment decisions.

**Production Cost: $0/month** - Built entirely on free-tier services.

---

## Features

- **📊 Deal Analysis Hub** - ARV, Repair, MAO, ROI calculators
- **🤖 AI Deal Scoring** - Powered by Google Gemini (free tier)
- **📝 Custom Formula Builder** - Create proprietary calculations
- **🏠 User Comps Database** - Build your own comparable sales database
- **📥 Deal Submission Workflow** - Streamlined team deal entry
- **✅ Approval Workflow** - Collaborative review process
- **📤 Public Deal Sharing** - Share deals via secure links
- **🐕 Scout Mode** - Bird dog lead capture without login
- **👥 Team Management** - Role-based access control
- **📊 Analytics Dashboard** - Team performance metrics
- **📱 PWA Support** - Install on mobile, offline access
- **🌙 Dark/Light Theme** - User preference

See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for detailed feature descriptions.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.10 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Radix UI | Various | Accessible UI primitives |
| Recharts | 3.5.1 | Charts |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless functions |
| Supabase | PostgreSQL + Auth + Storage |
| Google Gemini | AI deal scoring |
| Geoapify | Geocoding & maps |
| Resend | Transactional email |

### External Services (All Free Tier)

| Service | Free Limit | Cost |
|---------|------------|------|
| Supabase | 500MB DB, 2GB storage, 50K users | $0 |
| Google Gemini | 1M tokens/day | $0 |
| Geoapify | 3K requests/day | $0 |
| Resend | 100 emails/day | $0 |
| Cloudinary | 25GB storage | $0 |
| Vercel | Unlimited deploys | $0 |

**Total Monthly Cost: $0**

---

## Project Structure

```
dealflow/
├── public/                # Static assets
│   ├── icons/             # PWA icons
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── calculators/   # Public calculators
│   │   ├── dashboard/     # Protected dashboard
│   │   ├── scout/         # Public lead capture
│   │   └── share/         # Public deal sharing
│   ├── components/        # React components
│   │   ├── deals/         # Deal-related
│   │   ├── layout/        # Layout (sidebar, topbar)
│   │   ├── providers/     # Context providers
│   │   └── ui/            # Shadcn UI components
│   ├── lib/               # Utilities
│   │   ├── ai/            # Gemini integration
│   │   ├── formulas/      # Formula engine
│   │   ├── integrations/  # External APIs
│   │   └── services/      # Business logic
│   └── utils/             # Supabase clients
├── supabase/
│   └── migrations/        # Database migrations
├── .env.local             # Environment variables
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free)
- API keys (see Environment Variables)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dealflow.git
cd dealflow

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your environment variables to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run migrations in order (see below)

---

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Google Gemini AI (free: https://makersuite.google.com/app/apikey)
GOOGLE_GEMINI_API_KEY=AIzaSyxxx...

# Geoapify (free: https://www.geoapify.com/)
NEXT_PUBLIC_GEOAPIFY_KEY=xxx...

# Resend (free: https://resend.com)
RESEND_API_KEY=re_xxx...
EMAIL_FROM=onboarding@resend.dev

# Admin access
ADMIN_EMAIL=admin@example.com
```

### Optional

```bash
# Cloudinary (image hosting)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DealFlow
```

---

## Database Migrations

Run these SQL migrations in Supabase SQL Editor in order:

### Core Migrations

1. `005_full_platform.sql` - Base tables
2. `20250601_multi_tenancy.sql` - Organizations
3. `20250602_multi_tenancy_sync.sql` - Sync functions
4. `20250603_invitation_system.sql` - Team invites
5. `003_notifications.sql` - Notifications
6. `004_audit_logs.sql` - Audit trail

### Feature Migrations

7. `20260106_contacts.sql` - CRM contacts
8. `20260107_freemium_usage.sql` - Usage tracking
9. `20260108_user_profiles.sql` - Enhanced profiles
10. `20260109_share_and_scout_features.sql` - Sharing
11. `20260110_security_features.sql` - Security
12. `20260115_user_comps.sql` - User comparables

### Important Notes

- `profiles` table uses `id` (NOT `user_id`) referencing `auth.users(id)`
- Valid roles: `'agent'`, `'underwriter'`, `'admin'`, `'investor'`

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

---

## API Routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health/database` | GET | No | Database health check |
| `/api/integrations/gemini` | GET | No | AI API status |
| `/api/integrations/geoapify` | GET | No | Maps API status |
| `/api/deals/score` | POST | Yes | AI score a deal |
| `/api/formulas` | GET/POST | Yes | Manage formulas |
| `/api/usage` | GET/POST | Yes | Usage tracking |
| `/api/scout/submit` | POST | No | Submit scout lead |

---

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, user management, settings |
| `underwriter` | Review deals, approve/reject, analytics |
| `agent` | Submit deals, view own deals |
| `investor` | Investor portal, funding requests |

---

## Troubleshooting

### Common Issues

**"Cannot find module" Error**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**Supabase Auth Issues**
- Check URL and anon key in `.env.local`
- Verify redirect URLs in Supabase Auth settings

**AI Scoring Not Working**
- Verify `GOOGLE_GEMINI_API_KEY` is set
- Check quota at [Google AI Studio](https://makersuite.google.com)
- Test: `/api/integrations/gemini`

**Database RLS Errors**
- Ensure user is authenticated
- Check `organization_id` is set on user profile
- Verify RLS policies in Supabase

### Debug Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/health/database` | Test DB connection |
| `/api/integrations/gemini` | Test AI API |
| `/api/integrations/geoapify` | Test geocoding |
| `/api/integrations/email` | Test email |
| `/admin/status` | Full system health |

---

## Scripts

```bash
npm run dev        # Development server with Turbopack
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- **Documentation**: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/dealflow/issues)

---

<p align="center">
  Built with ❤️ for real estate professionals
</p>
