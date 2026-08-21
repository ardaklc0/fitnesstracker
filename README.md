# Fitness Tracker (PWA)

This project implements a personal fitness tracking Progressive Web App using Next.js, TypeScript, Tailwind CSS, and Supabase.

Quick start:

```bash
npm install
npm run dev
```

Create a `.env` from `.env.example` and set your Supabase URL and anon key.

Phased plan:
- Phase 1: Scaffold Next.js + TypeScript + Tailwind
- Phase 2: Database migrations and RLS
- Phase 3: Seed default programs and exercises
- ... (see project plan)

Database setup (local / Supabase)

This project contains SQL migration files under `supabase/migrations` and a seed file at `supabase/seed/seed.sql`.

To apply migrations and seed your database locally or to a remote Postgres instance, set the `DATABASE_URL` environment variable to a Postgres connection string and run:

```bash
# install deps first
npm install

# apply migrations
npm run migrate

# run seed
npm run seed
```

Notes:
- `DATABASE_URL` should be a full Postgres connection string (e.g. `postgres://user:password@host:5432/dbname`).
- Do NOT commit your database credentials. Use environment variables or CI secrets.
- For a Supabase project, you can get the database connection string from the Supabase dashboard (DB > Connection string).
