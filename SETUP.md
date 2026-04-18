# Consular – Setup Guide

Visa processing platform for Indian passport holders.

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- AWS S3 (or Cloudflare R2)
- Razorpay account (test keys for dev)
- Google Vision API key (for OCR)
- SMTP credentials (Resend recommended)

---

## 1. Install dependencies

```bash
cd consular
npm install
```

---

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Min 32-char random string |
| `REDIS_URL` | Redis connection URL |
| `AWS_*` | S3 or R2 credentials |
| `RAZORPAY_KEY_ID / SECRET` | From Razorpay dashboard |
| `SMTP_*` | SMTP credentials (use Resend API key as password) |
| `GOOGLE_VISION_API_KEY` | From Google Cloud Console |
| `ENCRYPTION_KEY` | Exactly 32 characters — used for passport number encryption |

---

## 3. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Seed initial data (countries, policies, admin user)
npm run db:seed
```

**Default credentials after seed:**
- Admin: `admin@consular.in` / `Admin@Consular2024`
- Ops: `ops@consular.in` / `Ops@Consular2024`

---

## 4. Run the development server

In two separate terminals:

```bash
# Terminal 1 – Next.js
npm run dev

# Terminal 2 – BullMQ workers
npm run worker
```

App runs at: http://localhost:3000
Admin panel: http://localhost:3000/admin

---

## 5. S3 bucket configuration

Create a private S3 bucket. Set CORS to allow your domain:

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": ["https://yourdomain.com"],
  "ExposeHeaders": []
}]
```

Block all public access. Documents are accessed via pre-signed URLs (15-min expiry).

---

## 6. Adding a new country/policy

1. Insert country into `countries` table (or use seed)
2. Go to `/admin/policy`
3. Insert policy record via Prisma Studio or direct SQL
4. Add source URLs for the policy refresh engine
5. Set status to `ACTIVE` when ready

---

## Architecture summary

```
app/
  (customer)/     → Customer-facing routes (public + authenticated)
  (admin)/admin/  → Ops team dashboard (ops role required)
  api/            → API routes (Next.js)

lib/
  services/       → Business logic (policy, application, checklist, payment…)
  auth/           → NextAuth config + role guards
  jobs/           → BullMQ queue definitions
  storage/        → S3 utilities
  utils/          → Crypto, validators, cn

workers/
  processors/     → BullMQ job processors (OCR, policy refresh, notifications)

prisma/
  schema.prisma   → Full database schema (17 models)
  seed.ts         → Initial data (countries, policies, admin users)
```

---

## Key design decisions

- **Policy versioning**: Policies are never overwritten. Every change creates a `PolicySnapshot`. Admin must approve before it goes live. Customers always see the policy version that was active when their application was created.
- **Passport encryption**: Passport numbers are AES-256-GCM encrypted at the application layer before DB storage. Only decrypted on explicit admin reads.
- **Signed URLs**: Documents are stored in a private S3 bucket. Access is via 15-minute pre-signed URLs generated on demand. URLs are never stored in the database.
- **Checklist locking**: Payment is blocked until all required checklist items are `APPROVED` by ops team.
- **No auto-publish**: Policy refresh engine detects changes but never publishes automatically. All changes require admin approval.

---

## Production checklist

- [ ] Set `NEXTAUTH_SECRET` to a strong random value
- [ ] Set `ENCRYPTION_KEY` to exactly 32 chars and back it up securely
- [ ] Configure S3 bucket with block-all-public-access
- [ ] Set up Razorpay webhooks pointing to `/api/payments/verify`
- [ ] Configure SMTP/Resend for transactional email
- [ ] Run workers as a separate process (PM2, Railway, etc.)
- [ ] Set up PostgreSQL with SSL
- [ ] Configure Redis with persistence
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Review and tighten Next.js `Content-Security-Policy` headers

---

## Roadmap (V2+)

- WhatsApp notifications (Interakt / Gupshup)
- Self-service team invites
- Multi-entry and long-stay visa types
- Schengen zone grouping
- Appointment booking integration (VFS)
- Customer mobile app
- AI-assisted policy change summarization
- Multi-language support (Hindi first)
