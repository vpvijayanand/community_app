# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Maratha** is a full-stack Tamil matrimony/matchmaking platform with astrology compatibility matching. It is a monorepo with three packages:

- `app_full/` — Next.js 15 frontend (React 19, App Router)gcloud auth application-default login --add-quota-project-to-adc
- `backend/` — Node.js/Express REST API + Socket.IO
- `database/` — PostgreSQL schema definitions

## Commands

### Frontend (`app_full/`)
```bash
npm run dev      # Dev server on :3000
npm run build    # Production build
npm start        # Run production server
npm run lint     # ESLint
```

### Backend (`backend/`)
```bash
npm run dev          # Dev server on :5000 (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server
npm run db:migrate   # Create/update all DB tables
npm run db:seed      # Populate demo data
```

## Architecture

### Data Flow
```
Next.js (App Router) → REST API + Socket.IO → Express → PostgreSQL (node-pg/Knex)
```

### Frontend (`app_full/`)

- `app/` — Next.js App Router pages: `login`, `dashboard`, `matches`, `chat`, `profile-wizard`, `astrology`, `admin`, `subscription`
- `components/` — Reusable UI built on Radix UI + Tailwind CSS 4
- `lib/` — React Context providers for auth, profiles, chat, news, and astrology data
- `hooks/` — Zustand stores (chat, profile) and utility hooks (language/i18n, toast)

**Path alias:** `@/*` maps to the `app_full/` root.

**Auth (frontend):** JWT tokens stored in context/localStorage. Dev credentials are hardcoded in `lib/auth-context.tsx`. Roles: `admin`, `groom`, `bride`, `parent`, `normal`.

**i18n:** The app has multi-language support (Tamil/English) managed via a language hook.

### Backend (`backend/`)

- `routes/` — Express routers: `auth`, `profile`, `matches`, `chat`, `news`, `subscription`, `admin`, `upload`
- `middleware/` — JWT auth middleware, error handler
- `db/` — Migration scripts and seed data (27 tables)
- `config/` — Database pool config (Knex, min 2/max 10 connections), JWT config
- `socket.ts` — Socket.IO handler for real-time chat

**Auth (backend):** JWT access tokens (7-day) + refresh tokens (30-day), bcryptjs password hashing, Google/Facebook OAuth via `oauth_accounts` table.

### Database (27 tables, PostgreSQL)

Key table groups:
- **Users/Auth:** `users`, `oauth_accounts`
- **Profiles:** `profiles` (6-step wizard), `horoscope_details`, `family_details`, `lifestyle_details`
- **Astrology:** `astrology_details`, `planet_positions`, `poruthams` (zodiac compatibility)
- **Matchmaking:** `interests`, `matches`
- **Messaging:** `chat_conversations`, `chat_messages`
- **Monetization:** `subscriptions`, `subscription_plans`
- **Content:** `news`, `ads`

### Key Dependencies

| Area | Libraries |
|------|-----------|
| UI | Radix UI, Tailwind CSS 4, Framer Motion, Lucide |
| Forms | React Hook Form + Zod |
| State | Zustand + React Context |
| Charts | Recharts (admin dashboard) |
| Real-time | Socket.IO |
| Files | AWS S3, Multer, Sharp |
| Payments | Razorpay |
| DB | Knex query builder, node-pg |

## Configuration

- `backend/.env` — DB credentials, JWT secrets, AWS S3 keys, OAuth credentials, upload limits
- `backend/knexfile.ts` — DB pool configuration
- `app_full/next.config.mjs` — TypeScript errors and image optimization are disabled in builds
- `app_full/tsconfig.json` — strict mode enabled; use `@/` alias for imports
