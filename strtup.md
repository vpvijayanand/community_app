# Maratha Startup Guide

This guide provides the steps to run the Maratha full-stack application locally.

## Prerequisites

- **Node.js**: Version 20 or higher recommended.
- **PostgreSQL**: Ensure you have a running PostgreSQL instance.

---

## 1. Backend Setup

The backend is built with Node.js, Express, and Knex (PostgreSQL).

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (REQUIRED):**
   - Create a `.env` file in the `backend/` directory with the following content:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=new_maratha_latest_1
     DB_USER=postgres
     DB_PASSWORD=postgres
     PORT=5000
     JWT_SECRET=maratha_jwt_secret_key_2024
     JWT_REFRESH_SECRET=maratha_refresh_secret_key_2024
     FRONTEND_URL=http://localhost:3000
     NODE_ENV=development
     ```
   > ⚠️ **If this file is missing, the backend will fail to start silently.**


4. **Initialize Database:**
   - **Note:** The backend is configured to **automatically run migrations** on startup.
   - If you need to manually manage the database, you can use:
     - `npm run db:migrate` (Run migrations)
     - `npm run db:seed` (Populate demo data)

5. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   The backend will start on [http://localhost:5000](http://localhost:5000).

---

## 2. Frontend Setup

The frontend is built with Next.js 15.

1. **Navigate to the frontend directory:**
   ```bash
   cd app_full
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(Note: You can also use `pnpm install` if you have pnpm installed)*

3. **Start the Frontend Server:**
   ```bash
   npm run dev
   ```
   The frontend will start on [http://localhost:3000](http://localhost:3000).

---

## Summary of Commands

| Component | Directory | Install | Start (Dev) |
|-----------|-----------|---------|-------------|
| **Backend** | `backend` | `npm install` | `npm run dev` |
| **Frontend** | `app_full` | `npm install` | `npm run dev` |

### Database Management (Backend)
- **Migrate:** `npm run db:migrate` (Auto-runs on `npm run dev`)
- **Seed:** `npm run db:seed`
