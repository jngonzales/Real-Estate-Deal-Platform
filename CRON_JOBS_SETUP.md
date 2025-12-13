# 🤖 Cron Jobs Setup Guide

## Overview
This platform uses **external cron jobs** via cron-job.org to automate routine tasks without Vercel's cron limitations.

---

## 📋 Available Cron Jobs

### 1. **Daily Cleanup** (`/api/cron/cleanup`)
**Purpose:** Maintain database health by removing old data

**What it does:**
- 🗑️ Deletes rejected deals older than 90 days
- 📦 Archives closed deals older than 1 year

**Recommended Schedule:** Daily at 2:00 AM
```
Every day at 2:00
```

**Setup on cron-job.org:**
```
Title: Daily Deal Cleanup
URL: https://your-domain.vercel.app/api/cron/cleanup
Schedule: Every day at [2] : [00]
Custom Header: Authorization: Bearer YOUR_CRON_SECRET
```

---

### 2. **Weekly Report** (`/api/cron/weekly-report`)
**Purpose:** Generate pipeline analytics for admin review

**What it does:**
- 📊 Calculates deals submitted in last 7 days
- 💰 Computes total pipeline value
- 📈 Breaks down deals by status
- 👥 Shows active user count

**Recommended Schedule:** Every Monday at 9:00 AM
```
Every 1 week on Monday at 9:00
```

**Setup on cron-job.org:**
```
Title: Weekly Pipeline Report
URL: https://your-domain.vercel.app/api/cron/weekly-report
Schedule: Every [1] week(s) of the month at [9] : [00] on [Monday]
Custom Header: Authorization: Bearer YOUR_CRON_SECRET
```

---

### 3. **Deal Reminders** (`/api/cron/send-reminders`)
**Purpose:** Notify agents about deals needing attention

**What it does:**
- 🔔 Alerts for deals in "needs_info" status 3+ days
- ⏰ Alerts for deals in "submitted" status 5+ days without review
- 📧 Groups reminders by agent (ready for email integration)

**Recommended Schedule:** Every weekday at 10:00 AM
```
Every day at 10:00 (Monday-Friday)
```

**Setup on cron-job.org:**
```
Title: Daily Deal Reminders
URL: https://your-domain.vercel.app/api/cron/send-reminders
Schedule: Custom
Cron Expression: 0 10 * * 1-5
Custom Header: Authorization: Bearer YOUR_CRON_SECRET
```

---

## 🔐 Security Setup

### Step 1: Generate Secret Key
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Add to Environment Variables

**Local Development** (`.env.local`):
```bash
CRON_SECRET=your-generated-secret-here
```

**Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add new variable:
   - Name: `CRON_SECRET`
   - Value: (your generated secret)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
3. Redeploy your app

---

## 🚀 Quick Setup on cron-job.org

### 1. Create Account
Visit [cron-job.org](https://cron-job.org) and sign up (free)

### 2. Create New Cron Job
Click "Cronjobs" → "Create cronjob"

### 3. Fill Basic Info
- **Title:** `Daily Deal Cleanup` (or other job name)
- **URL:** `https://your-domain.vercel.app/api/cron/cleanup`
- ✅ **Enable job**
- ✅ **Save responses in job history**

### 4. Set Schedule
Choose your preferred schedule:
- Daily cleanup: `Every day at 2:00`
- Weekly report: `Every 1 week on Monday at 9:00`
- Reminders: Use custom cron `0 10 * * 1-5`

### 5. Add Authorization (ADVANCED tab)
Click "ADVANCED" → Add custom header:
```
Authorization: Bearer your-cron-secret-here
```

### 6. Configure Notifications
- ✅ Notify me when execution of the cronjob fails
- After: `1` failure(s)
- ✅ The cronjob will be disabled because of too many failures
- After: `3` consecutive failures

### 7. Test & Create
1. Click **"TEST RUN"** to verify it works
2. Check response should be `200 OK`
3. Click **"CREATE"** to save

---

## 🧪 Testing Locally

### Test Cleanup:
```bash
curl http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Weekly Report:
```bash
curl http://localhost:3000/api/cron/weekly-report \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Reminders:
```bash
curl http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

Expected response:
```json
{
  "success": true,
  "message": "...",
  "results": {...}
}
```

---

## 📊 Monitoring

### View Execution History
1. Go to cron-job.org dashboard
2. Click on your cron job
3. View "Execution history" tab
4. Check response codes and output

### Check Logs in Vercel
1. Go to Vercel Dashboard → Your Project
2. Click "Logs" tab
3. Search for `[CRON]` to see execution logs

---

## 🔄 Future Enhancements

### Email Integration (Resend/SendGrid)
Add to `.env.local`:
```bash
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

Update cron jobs to send actual emails:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.FROM_EMAIL!,
  to: agent.email,
  subject: 'Deal Reminder - Action Required',
  html: generateReminderHTML(reminders)
});
```

---

## ❓ Troubleshooting

### Error: "Unauthorized"
- ✅ Check `CRON_SECRET` is set in Vercel
- ✅ Verify authorization header matches exactly
- ✅ No extra spaces in the header value

### Error: "Cron secret not configured"
- ✅ Add `CRON_SECRET` to Vercel environment variables
- ✅ Redeploy the application

### Cron job not running
- ✅ Check job is enabled on cron-job.org
- ✅ Verify schedule is correct
- ✅ Test URL manually with curl

### Rate Limiting
- ✅ Free tier on cron-job.org: unlimited jobs
- ✅ Vercel: No limits on API routes
- ✅ Keep cron frequency reasonable

---

## 📝 Summary

| Job | Schedule | Purpose |
|-----|----------|---------|
| Daily Cleanup | Daily 2 AM | Delete old rejected deals, archive closed |
| Weekly Report | Monday 9 AM | Generate pipeline statistics |
| Deal Reminders | Weekday 10 AM | Alert agents about pending deals |

**Total Cost:** $0/month (100% free with cron-job.org) 🎉

---

## ✅ Checklist

- [ ] Generate `CRON_SECRET`
- [ ] Add `CRON_SECRET` to Vercel
- [ ] Create cron-job.org account
- [ ] Set up Daily Cleanup job
- [ ] Set up Weekly Report job
- [ ] Set up Deal Reminders job
- [ ] Test all jobs with curl
- [ ] Monitor first executions
- [ ] (Optional) Add email integration

**Your platform now has enterprise-level automation!** 🚀
