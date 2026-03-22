# Pureblog

A self-hosted blogging platform built with Next.js, MongoDB, and Tailwind CSS. Designed to be clean, fast, and fully manageable through a built-in admin panel.

## Features

- **Posts** — Create, edit, schedule, and publish posts with Markdown support
- **Categories, Tags & Series** — Organize content with flexible taxonomies
- **Featured Posts** — Highlight posts on the homepage via a carousel
- **Comments** — Reader comments with admin moderation
- **Reactions** — Emoji reactions on posts
- **Newsletter** — Built-in subscriber management and email campaigns
- **Contact Form** — Direct messaging from the site
- **Bookmarks** — Let readers save posts for later
- **Search** — Full-text search across posts
- **RSS Feed** — Auto-generated RSS at `/rss.xml`
- **Sitemap & Robots** — SEO-ready at `/sitemap.xml` and `/robots.txt`
- **OG Images** — Dynamic Open Graph images for social sharing
- **Admin Panel** — Manage everything from `/admin`
- **Authentication** — Secured admin access via NextAuth

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [MongoDB](https://www.mongodb.com) with Mongoose
- [Tailwind CSS](https://tailwindcss.com) v4
- [NextAuth.js](https://next-auth.js.org)
- [pnpm](https://pnpm.io)

## Getting Started

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env.local` and fill in the required variables:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Secret for NextAuth session signing (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |
| `AUTH_ADMIN_EMAIL` | Admin login email |
| `AUTH_ADMIN_PASSWORD_PLAIN` | Admin password as plain text — **local dev only** |
| `AUTH_ADMIN_PASSWORD` | Admin password as bcrypt hash — **use in production** |

> See `.env.example` for the full list.

### Admin Password

The app supports two modes for the admin password:

**Local development** — set `AUTH_ADMIN_PASSWORD_PLAIN` to your password as plain text. Simple and fast.

```env
AUTH_ADMIN_PASSWORD_PLAIN=mysecretpassword
```

**Production** — set `AUTH_ADMIN_PASSWORD` to a bcrypt hash instead. Remove or leave `AUTH_ADMIN_PASSWORD_PLAIN` unset.

Generate the hash with Node.js (no extra dependencies needed if bcryptjs is already installed):

```bash
node -e "import('bcryptjs').then(m => m.hash('yourpassword', 12).then(console.log))"
```

Then paste the output into your environment:

```env
AUTH_ADMIN_PASSWORD=$2b$12$...
```

> The app checks `AUTH_ADMIN_PASSWORD_PLAIN` first. If it is set, the hashed variable is ignored — so make sure it is removed or commented out in production.

## Project Structure

```
app/
  (main)/       # Public-facing pages
  admin/        # Admin panel pages and components
  api/          # API routes
components/     # Shared UI components
lib/            # Database, auth, and utility helpers
models/         # Mongoose models
types/          # TypeScript type definitions
public/         # Static assets
```
