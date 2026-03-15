# QuantATS — Quant & Crypto Recruitment Platform

A full-featured ATS (Applicant Tracking System) built specifically for quant and crypto headhunters. 5-user, self-hosted, completely free.

---

## What's included

- **Login system** — secure email/password auth, admin vs user roles
- **Candidates** — full database with skills, specialisms, salary, LinkedIn, CV notes
- **Clients** — company profiles with industry, stage, notes
- **Jobs** — open positions linked to clients, with salary ranges and headcount
- **Pipeline** — Kanban board per job (Sourced → Screened → Submitted → Interview → Offer → Placed)
- **Activities** — log calls, emails, interviews, meetings with timestamps
- **Analytics** — weekly charts for calls, new candidates, interviews, placements
- **Admin panel** — create and manage team users

---

## Setup Guide (30–45 minutes, no coding required)

### Step 1 — Create your Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and click **Start for free**
2. Sign up with GitHub or email
3. Click **New project**
4. Give it a name (e.g. `quantats`), set a strong database password, choose a region close to you
5. Wait ~2 minutes for it to spin up

### Step 2 — Run the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_schema.sql` from this project
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned."

### Step 3 — Get your API keys

1. In Supabase, go to **Settings → API**
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy the **anon public** key (long string starting with `eyJ...`)

### Step 4 — Create your admin account

1. In Supabase, go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a strong password
4. Click **Create user**
5. Now go to **SQL Editor** and run this (replace with your user's ID from the Users page):

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR-USER-ID-HERE';
```

### Step 5 — Deploy to Vercel (free)

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Create a new repository called `quantats` and upload all these project files
   - Easiest way: install [GitHub Desktop](https://desktop.github.com), drag the folder in
3. Go to [vercel.com](https://vercel.com) and sign up with GitHub
4. Click **Add New → Project**
5. Import your `quantats` repository
6. Before deploying, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Project URL from Step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key from Step 3
7. Click **Deploy**
8. Wait ~2 minutes. You'll get a URL like `https://quantats-xxx.vercel.app`

### Step 6 — Add your team (admin only)

1. Log in to your deployed app
2. Go to **Admin** in the sidebar
3. Click **Add User** and create accounts for your team members
4. Share the URL and their credentials with them

---

## Adding team members later

Only admins can create new users. Go to Admin → Add User. Set their role to `user` (they see everything but can't manage other users) or `admin` (full access).

---

## Local development (optional, for technical team members)

```bash
# Clone the repo
git clone your-repo-url
cd quantats

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase URL and key in .env.local

# Run locally
npm run dev
# Opens at http://localhost:3000
```

---

## Tech stack

| Layer | Tool | Cost |
|-------|------|------|
| Frontend | Next.js 14 (React) | Free |
| Hosting | Vercel | Free |
| Database | Supabase (PostgreSQL) | Free |
| Auth | Supabase Auth | Free |
| Charts | Recharts | Free |
| Icons | Lucide React | Free |

Supabase free tier: 50,000 database rows, 1GB storage, 50MB file storage. More than enough for a 5-person shop for years.

---

## File structure

```
quantats/
├── app/
│   ├── login/page.tsx          # Login screen
│   └── dashboard/
│       ├── layout.tsx          # Sidebar shell
│       ├── page.tsx            # Dashboard home
│       ├── candidates/         # Candidate list + detail + add form
│       ├── clients/            # Client list + add form
│       ├── jobs/               # Jobs list + add form
│       ├── pipeline/           # Kanban board
│       ├── activities/         # Activity log
│       ├── analytics/          # Charts & stats
│       └── admin/              # User management
├── components/
│   └── layout/Sidebar.tsx      # Navigation sidebar
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   └── types.ts                # TypeScript types
├── supabase/
│   └── migrations/001_schema.sql  # ← Run this in Supabase first
├── middleware.ts               # Auth route protection
└── .env.example                # Copy to .env.local
```
