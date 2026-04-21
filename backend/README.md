# Maratha Matrimony — Backend API

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt + Google/Facebook OAuth
- **Real-time:** Socket.IO (chat)
- **File uploads:** Multer

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create PostgreSQL database
createdb maratha_db

# 3. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# 4. Run migrations (auto-creates all tables)
npm run db:migrate

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | - | Register with email/password |
| POST | /api/auth/login | - | Login |
| POST | /api/auth/google | - | Google OAuth |
| POST | /api/auth/refresh | - | Refresh JWT |
| GET | /api/auth/me | ✅ | Current user |
| GET | /api/profile/me | ✅ | Own profile |
| POST | /api/profile/create | ✅ | Create/update profile (step-by-step) |
| GET | /api/profile/:id | ✅ | View profile |
| POST | /api/profile/:id/interest | ✅ | Express interest |
| GET | /api/matches | ✅ | Match list with filters |
| GET | /api/matches/:id/compatibility | ✅ | Porutham compatibility |
| GET | /api/chat/conversations | ✅ | Chat list |
| GET | /api/chat/:userId/messages | ✅ | Message thread |
| POST | /api/chat/:userId/send | ✅ | Send message |
| GET | /api/chat/limit | ✅ | Chat usage |
| GET | /api/news | - | News feed |
| GET | /api/news/:id | - | Article detail |
| GET | /api/subscription/plans | - | Plans |
| GET | /api/subscription/me | ✅ | Current plan |
| POST | /api/subscription/upgrade | ✅ | Upgrade |
| POST | /api/upload/photo | ✅ | Upload photo |
| GET | /api/admin/* | Admin | Admin endpoints |

## Database (27 tables)
Auto-created via `db:migrate`. See `src/db/migrate.ts` for full schema.
