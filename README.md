# Astrox — Sovereign Atelier

A luxury e-commerce platform crafted with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, and Prisma ORM backed by PostgreSQL 17.

---

## 🚀 100% Free Cloud Deployment Guide

Astrox is architected to run permanently on the free tier of industry-standard cloud providers:

| Layer | Provider | Free Tier Details |
|---|---|---|
| **Frontend & API Routes** | **Vercel** | 100% Free Hobby Tier. Unlimited bandwidth, global Edge CDN, free SSL, instant continuous deployment from GitHub. |
| **PostgreSQL Database** | **Neon** or **Supabase** | 100% Free Forever Tier. 0.5 GB storage, built-in connection pooling (PgBouncer), zero idle charge. |
| **Source Control** | **GitHub** | Free private/public repository. |

---

### Step 1: Provision Free Cloud Database (Neon)
1. Sign up for free at [neon.tech](https://neon.tech) (no credit card required).
2. Click **Create Project** and name it `astrox-db`.
3. In your Neon dashboard, copy the **Connection string** (make sure **Pooled connection** is toggled on):
   ```
   postgresql://[user]:[password]@[host]-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Push Database Schema & Seed Catalog
From your local terminal, apply the database schema and seed the catalog directly into your Neon cloud database:

```bash
# Push Prisma schema to cloud PostgreSQL
DATABASE_URL="postgresql://[user]:[password]@[host]-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" npx prisma db push

# Seed luxury products, royal categories, and demo data
DATABASE_URL="postgresql://[user]:[password]@[host]-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" npx tsx prisma/seed.ts
```

### Step 3: Push Code to GitHub
```bash
git init
git add .
git commit -m "feat: Astrox luxury platform ready for production"
git branch -M main
git remote add origin https://github.com/[your-username]/astrox.git
git push -u origin main
```

### Step 4: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** > **Project** and import your `astrox` repository.
3. In the **Environment Variables** section, configure:
   - `DATABASE_URL`: Your Neon pooled connection string.
   - `AUTH_SECRET`: A secure 32-character string (e.g. run `openssl rand -base64 32`).
   - `NEXT_PUBLIC_SITE_URL`: `https://[your-project-name].vercel.app`
   - `BKASH_MODE`: `mock`
   - `NAGAD_MODE`: `mock`
   - `SSLCOMMERZ_MODE`: `mock`
   - `STRIPE_MODE`: `mock`
   - `PATHAO_MODE`: `mock`
   - `STEADFAST_MODE`: `mock`
4. Click **Deploy**. Vercel will build and launch Astrox live within ~60 seconds.

---

## 💻 Local Development

```bash
# Start local development server (with auto-managed PostgreSQL)
./dev.sh

# Start local production build
./start.sh

# Run unit tests (42/42 vitest tests)
node scripts/with-db.mjs vitest run

# Run typecheck
node scripts/with-db.mjs tsc --noEmit
```
