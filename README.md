# PureBlog

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-0F172A?style=for-the-badge)](https://pureblog.vercel.app/)

A self-hosted, production-ready blogging platform with a full admin panel, rich text editing, newsletter management, comment moderation, and comprehensive SEO — built on Next.js 16 and MongoDB.

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Features](#features)
  - [Content Management](#content-management)
  - [Rich Text Editor](#rich-text-editor)
  - [SEO](#seo)
  - [Performance and Caching](#performance-and-caching)
  - [Security](#security)
  - [Newsletter and Email](#newsletter-and-email)
  - [Reader Features](#reader-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
  - [Admin Password Setup](#admin-password-setup)
- [Admin Panel](#admin-panel)
  - [Dashboard](#dashboard)
  - [Posts](#posts)
  - [Authors](#authors)
  - [Categories](#categories)
  - [Tags](#tags)
  - [Series](#series)
  - [Comments](#comments)
  - [Messages](#messages)
  - [Subscribers](#subscribers)
  - [Settings](#settings)
- [Public Pages](#public-pages)
- [Deployment](#deployment)
  - [Deploy to Vercel](#deploy-to-vercel)
  - [Build Commands](#build-commands)
  - [Self-Hosting](#self-hosting)
- [Cron Jobs](#cron-jobs)
- [License](#license)
- [Author](#author)

---

## Overview

PureBlog is a fully self-hosted blogging platform that gives you complete ownership over your content, readers, and data. It is designed around a single admin user model — no multi-tenant complexity, no third-party CMS dependency, no external content API. Everything from post creation to newsletter delivery runs within the same Next.js application.

The platform is built with the Next.js App Router, server components, and ISR caching, making it fast by default. The admin panel covers the full content lifecycle: write with a feature-complete rich text editor, organize with categories, tags, and series, moderate comments, manage subscribers, and configure the entire site appearance from a single settings page. Reader-facing features include full-text search, bookmarks, reactions, comment threads, series navigation, and an RSS feed.

---

## Screenshots

> Place screenshot files in `./public/screenshots/` to display them here.

<table>
  <tr>
    <td align="center">
      <img src="./public/screenshots/homepage.png" alt="Homepage" width="100%" />
      <br /><strong>Homepage</strong>
    </td>
    <td align="center">
      <img src="./public/screenshots/blog-listing.png" alt="Blog Listing" width="100%" />
      <br /><strong>Blog Listing</strong>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./public/screenshots/blog-post.png" alt="Blog Post" width="100%" />
      <br /><strong>Blog Post</strong>
    </td>
    <td align="center">
      <img src="./public/screenshots/admin-dashboard.png" alt="Admin Dashboard" width="100%" />
      <br /><strong>Admin Dashboard</strong>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./public/screenshots/admin-posts.png" alt="Posts Management" width="100%" />
      <br /><strong>Posts Management</strong>
    </td>
    <td align="center">
      <img src="./public/screenshots/admin-editor.png" alt="Rich Text Editor" width="100%" />
      <br /><strong>Rich Text Editor</strong>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./public/screenshots/admin-settings.png" alt="Site Settings" width="100%" />
      <br /><strong>Site Settings</strong>
    </td>
    <td align="center">
      <img src="./public/screenshots/mobile.png" alt="Mobile View" width="100%" />
      <br /><strong>Mobile View</strong>
    </td>
  </tr>
</table>

---

## Architecture

PureBlog uses the Next.js App Router with two distinct route groups. The `(main)` group handles all public-facing pages as server components with ISR. The `admin/` group is session-gated and handles all content management operations via server actions and API routes. Static assets and uploaded media are served from Cloudinary.

Data access follows a MongoDB singleton connection pattern (`lib/db.ts`) with a connection pool of 10 to handle serverless cold starts efficiently. Reads on high-traffic routes are wrapped in `unstable_cache` with named tags (`categories`, `settings`, `posts`). Every admin mutation calls `revalidateTag` for the relevant tag, ensuring cached pages are rebuilt on the next request without a full redeploy.

Authentication is handled by NextAuth v5 with a credentials provider and JWT session strategy. Login attempts are rate-limited in-process at 5 requests per 15-minute window per IP. The same in-process rate limiter (`lib/rate-limit.ts`) protects the comment submission, contact form, and newsletter signup endpoints.

```mermaid
graph TD
  Browser --> NextJS["Next.js 16 (App Router)"]
  NextJS --> MainGroup["(main) — Public Pages (ISR)"]
  NextJS --> AdminGroup["admin/ — Protected Panel"]
  NextJS --> APIRoutes["api/ — REST endpoints"]
  MainGroup --> CacheLayer["unstable_cache / revalidateTag"]
  AdminGroup --> ServerActions["Server Actions"]
  CacheLayer --> MongoDB[("MongoDB / Mongoose")]
  ServerActions --> MongoDB
  APIRoutes --> MongoDB
  ServerActions --> Cloudinary["Cloudinary CDN"]
  ServerActions --> Nodemailer["Nodemailer / Gmail SMTP"]
  NextJS --> NextAuth["NextAuth v5 / JWT"]
  NextAuth --> RateLimit["In-process Rate Limiter"]
```

---

## Tech Stack

| Category        | Technology                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | Next.js 16.1.6 (App Router)                          |
| Language        | TypeScript 5                                         |
| UI              | React 19, Tailwind CSS 4, shadcn/ui, Base UI 1.3     |
| Animation       | Framer Motion 12, Motion                             |
| Rich Text       | Tiptap 3.21 with 20+ extensions                      |
| Database        | MongoDB with Mongoose 9                              |
| Auth            | NextAuth v5 (credentials provider, JWT sessions)     |
| Validation      | Zod 3, React Hook Form 7                             |
| Image Hosting   | Cloudinary 2                                         |
| Email           | Nodemailer 8 + Gmail SMTP, React Email               |
| Icons           | Lucide React                                         |
| Date Handling   | date-fns 4                                           |
| Deployment      | Vercel (with cron jobs)                              |
| Package Manager | pnpm                                                 |

### Tiptap Extensions

StarterKit, Bold, Italic, Underline, Strike, Link, Image (resizable), Placeholder, CodeBlockLowlight (syntax highlighting via Lowlight), Highlight, TextAlign, TextStyle, Color, FontFamily, FontSize, LineHeight, Subscript, Superscript, Table + TableRow + TableCell + TableHeader + TableCaption, TaskList + TaskItem, Typography, YouTube, CharacterCount — plus custom extensions: Audio, CodeSandbox embed, Columns (multi-column layout), Details/Summary (collapsible), FileAttachment, Indent, Math (KaTeX inline and block), Twitter/X card embed, Vimeo embed.

---

## File Structure

```
pureblog/
├── app/
│   ├── (main)/                     # Public-facing route group
│   │   ├── page.tsx                # Homepage
│   │   ├── blog/                   # Blog listing and post detail pages
│   │   ├── author/                 # Author list and author detail pages
│   │   ├── categories/             # Category list and category detail pages
│   │   ├── tags/                   # Tag list and tag detail pages
│   │   ├── series/                 # Series list and series detail pages
│   │   ├── search/                 # Full-text search page
│   │   ├── bookmarks/              # Client-side saved posts page
│   │   ├── contact/                # Contact form page
│   │   ├── about/                  # Static about page
│   │   └── preview/                # Token-gated draft preview
│   ├── admin/                      # Protected admin panel (session-gated)
│   │   ├── page.tsx                # Dashboard
│   │   ├── posts/                  # Post list, create, and edit
│   │   ├── authors/                # Author management
│   │   ├── categories/             # Category management
│   │   ├── tags/                   # Tag overview
│   │   ├── series/                 # Series management
│   │   ├── comments/               # Comment moderation
│   │   ├── messages/               # Contact form inbox
│   │   ├── subscribers/            # Newsletter subscriber management
│   │   └── settings/               # Site-wide settings
│   ├── api/
│   │   ├── auth/                   # NextAuth handlers
│   │   ├── admin/                  # Admin CRUD API routes
│   │   ├── posts/                  # View counter and reaction endpoints
│   │   ├── search/                 # Full-text search endpoint
│   │   ├── contact/                # Contact form submission endpoint
│   │   ├── newsletter/             # Subscribe and unsubscribe endpoints
│   │   ├── upload/                 # Cloudinary upload proxy
│   │   ├── og/                     # Dynamic OG image generation
│   │   └── cron/publish/           # Scheduled post publishing (Vercel cron)
│   ├── feed.xml/                   # RSS feed route
│   ├── sitemap.ts                  # Dynamic XML sitemap
│   ├── robots.ts                   # Robots.txt
│   └── manifest.ts                 # PWA manifest
├── components/
│   ├── ui/                         # shadcn/ui primitives and custom UI components
│   ├── editor/                     # Tiptap editor, toolbar, extensions, and node views
│   │   ├── tiptap-editor.tsx       # Main editor component
│   │   ├── editor-toolbar.tsx      # Formatting toolbar
│   │   ├── bubble-menu.tsx         # Inline formatting context menu
│   │   ├── slash-command.tsx       # Slash command menu for block insertion
│   │   └── extensions/             # Custom Tiptap extension implementations
│   ├── navbar.tsx                  # Site navigation
│   ├── footer.tsx                  # Site footer
│   ├── post-card.tsx               # Post summary card
│   ├── featured-carousel.tsx       # Featured posts carousel
│   ├── blog-posts.tsx              # Paginated post listing
│   ├── comment-section.tsx         # Comment submission and display
│   ├── reaction-bar.tsx            # Heart reaction with confetti and sound
│   ├── table-of-contents.tsx       # Auto-generated post TOC
│   ├── series-navigation.tsx       # Previous/next navigation within a series
│   ├── share-buttons.tsx           # Copy link and native share
│   ├── bookmark-button.tsx         # localStorage bookmark toggle
│   ├── newsletter-section.tsx      # Email subscription form
│   └── ...                         # Additional page-level components
├── lib/
│   ├── db.ts                       # MongoDB singleton connection (pool size 10)
│   ├── cache.ts                    # unstable_cache wrappers per data type
│   ├── mailer.ts                   # Nodemailer / Gmail email sending functions
│   ├── rate-limit.ts               # In-process IP-based rate limiter
│   ├── metadata.ts                 # generateMetadata helpers for all routes
│   ├── reading-time.ts             # Reading time calculation
│   ├── toc.ts                      # Table of contents parser from HTML headings
│   └── utils.ts                    # Class merging, slug generation, misc helpers
├── models/                         # Mongoose schemas (Post, Author, Category, ...)
├── types/
│   └── index.ts                    # TypeScript interfaces for all data models
├── hooks/
│   ├── use-bookmarks.ts            # localStorage bookmark management hook
│   └── use-sound.ts                # Sound engine hook
├── emails/                         # React Email transactional templates
│   ├── new-comment.tsx             # Admin notification for new comments
│   ├── comment-approved.tsx        # Commenter notification on approval
│   └── newsletter-post.tsx         # Post announcement email template
├── public/                         # Static assets and screenshots
├── styles/                         # Global CSS
├── auth.ts                         # NextAuth configuration and credentials logic
├── env.ts                          # t3-env environment variable validation schema
├── next.config.ts                  # Security headers, image config, bundle analyzer
└── vercel.json                     # Vercel cron job schedule
```

---

## Features

### Content Management

- Full CRUD for posts, authors, categories, and series with automatic slug generation
- Draft and published status with an optional scheduled publishing date and time
- Bulk operations on the posts table: bulk delete and bulk publish
- CSV export for posts and subscribers
- Secure draft preview via a token-gated URL (`/preview/[slug]?token=...`) — share unpublished content without exposing the admin panel
- Post autosave to prevent content loss during editing

### Rich Text Editor

The editor is built on Tiptap 3 and supports the following:

- **Text formatting:** bold, italic, underline, strikethrough, text color, highlight, font size, font family, line height, subscript, superscript
- **Block types:** paragraph, headings (H1–H6), blockquote, code block with syntax highlighting, ordered and unordered lists, task lists
- **Advanced blocks:** tables with captions, multi-column layouts, collapsible details/summary sections, file attachments, audio embeds
- **Media:** images with drag-to-resize handles and Cloudinary upload, YouTube, Vimeo, Twitter/X card embeds, CodeSandbox embeds
- **Math:** inline and block math expressions rendered with KaTeX
- **Editor tools:** slash command menu for inserting any block type, bubble menu for inline formatting, block handle for drag-and-drop reordering, find and replace panel, HTML source view, character count, zen mode, typewriter mode

### SEO

- `generateMetadata()` on every page with title, description, canonical URL, Open Graph tags, and Twitter card tags
- Dynamic OG image generation via `next/og` at `/api/og` — renders post title, publication date, and site name as a 1200×630 image
- JSON-LD structured data: `Article` schema on post pages, `WebSite` with `SearchAction` on the homepage, `BreadcrumbList` on taxonomy pages
- Auto-generated sitemap at `/sitemap.xml` with per-route priority and change frequency settings, updated by `publishedAt` timestamps
- Robots rules at `/robots.txt` — disallows `/admin`, `/api`, and `/login`
- MongoDB compound text index on `title` and `content` for full-text search with relevance-score ranking

### Performance and Caching

- ISR via `unstable_cache` with tag-based invalidation — category, settings, and post caches are each invalidated independently on their respective admin mutations via `revalidateTag`
- Optimized package imports for `lucide-react`, `motion/react`, and `@tiptap/react` via `experimental.optimizePackageImports` in `next.config.ts`
- `next/image` with a 30-day minimum cache TTL and a permissive remote pattern for Cloudinary and any HTTPS image source
- Bundle analyzer available via `pnpm analyze` (`ANALYZE=true` environment variable)

### Security

The following HTTP response headers are applied to all routes via `next.config.ts`:

| Header                        | Value                              |
| ----------------------------- | ---------------------------------- |
| `X-Frame-Options`             | `DENY`                             |
| `X-Content-Type-Options`      | `nosniff`                          |
| `Strict-Transport-Security`   | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy`     | Restrictive policy, inline scripts blocked |
| `Permissions-Policy`          | Camera, microphone, geolocation disabled |
| `Referrer-Policy`             | `strict-origin-when-cross-origin`  |

Additional security measures:

- Rate limiting on login (5 requests per 15 minutes), comment submission (5 per 10 minutes), contact form (3 per hour), and newsletter signup (3 per hour) — all keyed by IP using `x-real-ip` with `x-forwarded-for` fallback
- Admin password stored as a bcrypt hash (`bcryptjs`, cost factor 12)
- Environment validation at startup via `@t3-oss/env-nextjs` with Zod schemas — the application will not boot if any required variable is missing or fails type validation

### Newsletter and Email

- Subscriber management with `active` and `unsubscribed` status
- Unique unsubscribe token per subscriber, embedded as a one-click link in every newsletter email
- Newsletter campaign dispatch from the admin panel — sends to all active subscribers simultaneously
- Scheduled and manual post publishing can trigger an automatic newsletter send to all active subscribers
- Three transactional email templates built with React Email:
  - New comment notification sent to the admin
  - Comment approval notification sent to the commenter
  - Post announcement email sent to newsletter subscribers

### Reader Features

- Heart reaction on posts: increments up to 3 times per user, triggers a canvas-confetti animation and sound effect on the third click
- View counter incremented server-side on each page visit
- Auto-generated table of contents from post headings with scroll-aware active state
- Series navigation bar when a post belongs to a series — links to previous and next posts in order
- Related posts by category (up to 3) displayed at the end of each post
- Comment section with nested reply support and pending/approved/rejected moderation states
- Client-side bookmarks stored in `localStorage`, displayed on a dedicated `/bookmarks` page
- Share buttons: copy link to clipboard, native Web Share API (mobile), platform-specific share
- Previous and next post navigation at the bottom of every post
- Grid and list view toggle on the blog listing page

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later — install with `npm install -g pnpm`
- A running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Cloudinary account — required for image uploads in the editor and settings
- A Gmail account with an App Password — required for email notifications and newsletter delivery

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/semihkececioglu/pureblog.git
   cd pureblog
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in the required environment variables (see the table below).

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open `http://localhost:3000` for the public blog and `http://localhost:3000/admin` for the admin panel. Log in with the credentials you set in `AUTH_ADMIN_EMAIL` and `AUTH_ADMIN_PASSWORD_PLAIN`.

---

## Environment Variables

### Required

| Variable                      | Description                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                 | MongoDB connection string. Example: `mongodb+srv://user:pass@cluster.mongodb.net/pureblog`                    |
| `AUTH_SECRET`                 | Random secret for signing JWT sessions. Must be at least 32 characters. Generate with `openssl rand -base64 32` |
| `AUTH_ADMIN_EMAIL`            | Email address used to log in to the admin panel                                                               |
| `AUTH_ADMIN_PASSWORD`         | Bcrypt hash of the admin password. **Use this in production.**                                                |
| `AUTH_ADMIN_PASSWORD_PLAIN`   | Admin password as plain text. **Local development only.** Overrides `AUTH_ADMIN_PASSWORD` when set           |
| `NEXT_PUBLIC_APP_URL`         | Full public URL of the deployed site including protocol. Example: `https://yourblog.com`                      |

### Optional

| Variable                    | Description                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GMAIL_USER`                | Gmail address used as the sender for all transactional and newsletter email                                                         |
| `GMAIL_APP_PASSWORD`        | Gmail App Password (not your account password). Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `CLOUDINARY_CLOUD_NAME`     | Cloudinary cloud name                                                                                                               |
| `CLOUDINARY_API_KEY`        | Cloudinary API key                                                                                                                  |
| `CLOUDINARY_API_SECRET`     | Cloudinary API secret                                                                                                               |
| `CRON_SECRET`               | Bearer token sent by Vercel with cron requests to authenticate the `/api/cron/publish` endpoint                                     |

### Admin Password Setup

**Development** — set `AUTH_ADMIN_PASSWORD_PLAIN` to your password as plain text:

```env
AUTH_ADMIN_PASSWORD_PLAIN=mysecretpassword
```

The application checks `AUTH_ADMIN_PASSWORD_PLAIN` first. If it is set, `AUTH_ADMIN_PASSWORD` is ignored entirely. Do not use this in production.

**Production** — generate a bcrypt hash and set `AUTH_ADMIN_PASSWORD`. Leave `AUTH_ADMIN_PASSWORD_PLAIN` unset.

```bash
node -e "import('bcryptjs').then(m => m.hash('yourpassword', 12).then(console.log))"
```

Paste the output into your environment:

```env
AUTH_ADMIN_PASSWORD=$2b$12$examplehashoutputhere
```

---

## Admin Panel

The admin panel is accessible at `/admin` and requires authentication. All routes under `/admin` are protected by NextAuth middleware. The panel is organized into ten sections.

### Dashboard

The dashboard provides a quick overview of the site's current state:

- Aggregate stat cards: total published posts, active subscribers, total page views, approved comments, pending comments, and unread messages
- Top 5 posts ranked by view count
- 5 most recently created posts with status badges
- Latest 3 pending comments for quick moderation
- Latest 3 unread contact messages
- Quick action buttons for creating a new post and reviewing all pending comments

### Posts

- Data table with search, category filter, author filter, and draft/published status filter
- Sortable columns: title, view count, creation date
- Bulk select with bulk delete and bulk publish operations
- CSV export of the current filtered post list
- Create and edit posts using the Tiptap rich text editor
- Cover image upload via Cloudinary
- Post metadata: category assignment, tag input, series membership and series order number
- Draft/published toggle and scheduled publishing date and time picker
- Excerpt field (max 160 characters) used as the page meta description
- Preview button opens the secure draft preview URL in a new tab without requiring the reader to log in

### Authors

- Create, edit, and delete author profiles
- Fields: name, slug, bio, avatar (Cloudinary upload)
- Social links: Twitter, Instagram, LinkedIn, GitHub, personal website
- Authors are assigned to posts in the post editor
- Post count displayed per author in the listing

### Categories

- Create, edit, and delete categories
- Fields: name, slug, description
- Post count displayed per category
- Categories are used for filtering on the blog listing page and for related post suggestions

### Tags

- Read-only aggregated view of all tags used across published posts
- Post count displayed per tag
- Tags are not a separate database entity — they are managed directly in the post editor as a comma-separated input and stored as an array on the Post document

### Series

- Create, edit, and delete post series
- Fields: name, slug, description
- Assign posts to a series and set their order number from within the post editor
- Series post list with drag-reorder support in the series detail view
- Post count displayed per series

### Comments

- Full paginated list of all submitted comments
- Filter by status: pending, approved, rejected
- Search by commenter name, email, or content
- Approve or reject individual comments
- Approved comments are immediately visible to readers on the post page
- Email notification sent to the admin when a new comment is submitted
- Email notification sent to the commenter when their comment is approved

### Messages

- Inbox for all contact form submissions
- Filter by read status: all, unread, read
- Search by sender name, email, or subject
- Mark individual messages as read or unread
- Reply to messages directly from the message detail view — reply is sent via Nodemailer to the sender's email address

### Subscribers

- Paginated list of all newsletter subscribers
- Filter by status: active, unsubscribed
- Search by email address
- Manually unsubscribe or reactivate individual subscribers
- Export the full subscriber list as a CSV file
- Send a newsletter campaign to all active subscribers from the admin panel — enter a custom subject and body, or link to a recent post

### Settings

The settings page controls all site-wide configuration. Changes take effect immediately and invalidate the settings cache.

| Setting                   | Description                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Site Name                 | Displayed in the browser tab, navbar, and outgoing emails. Max 60 characters               |
| Favicon                   | URL or Cloudinary upload. Recommended size: 32×32 or 64×64 px (PNG, ICO, or SVG)           |
| Welcome Title             | Large heading displayed in the homepage hero section                                        |
| Welcome Description       | Tagline displayed beneath the welcome title. Max 200 characters                             |
| Twitter / X               | Profile URL — displayed in the footer and about page                                        |
| GitHub                    | Profile URL                                                                                 |
| LinkedIn                  | Profile URL                                                                                 |
| Instagram                 | Profile URL                                                                                 |
| YouTube                   | Channel URL                                                                                 |
| Facebook                  | Page URL                                                                                    |
| Footer Text               | Copyright or custom text displayed at the bottom of every page                              |
| Default Meta Description  | Fallback meta description for pages without specific content. Max 160 characters            |
| Default OG Image          | Fallback image for social sharing. Recommended size: 1200×630 px                           |
| Google Analytics ID       | Measurement ID in `G-XXXXXXXXXX` format. Leave blank to disable Analytics                  |

---

## Public Pages

All public pages are server-rendered with ISR where applicable and include full SEO metadata, Open Graph tags, and JSON-LD structured data.

### Homepage ( `/` )

- Welcome section displaying the site title and description from settings
- Featured posts carousel — posts marked as `featured: true` in the editor
- Recent posts grid showing the 6 latest non-featured published posts
- Newsletter signup form with rate-limited submission
- Contact call-to-action section

### Blog Listing ( `/blog` )

- Paginated list of all published posts
- Filter by category via URL query parameter
- Sort by newest, oldest, or most viewed
- Toggle between grid and list view
- Post cards include cover image, title, excerpt, author name, publication date, category badge, and estimated reading time

### Blog Post ( `/blog/[slug]` )

- Full article rendered from Tiptap HTML output
- Auto-generated table of contents anchored to headings
- Series navigation bar when the post belongs to a series — links to the previous and next post in order, with a link to the full series
- Author card with bio, avatar, and social links
- Tag list with links to the corresponding tag detail pages
- Heart reaction button — increments up to 3 times, triggers canvas-confetti and a sound effect on the third click
- Related posts by category (up to 3)
- Comment section: approved comments displayed in a threaded layout, new comment submission form with validation
- Share buttons: copy link and native Web Share API
- Bookmark toggle (persisted to `localStorage`)
- View counter displayed in the post header (incremented server-side)
- Previous and next post navigation at the bottom

### Authors ( `/author` )

- Grid of all author profiles
- Each card displays the author's avatar or initials fallback, name, bio excerpt, and post count

### Author Detail ( `/author/[slug]` )

- Author bio, avatar, and social links
- Paginated list of all posts by this author

### Categories ( `/categories` )

- Grid of all categories
- Each card displays the category name, description, and post count

### Category Detail ( `/categories/[slug]` )

- Paginated list of all published posts in the selected category

### Tags ( `/tags` )

- All tags rendered as clickable pill badges
- Post count displayed on each badge

### Tag Detail ( `/tags/[slug]` )

- Paginated list of all published posts with the selected tag

### Series ( `/series` )

- Grid of all post series
- Each card displays the series name, description, and post count

### Series Detail ( `/series/[slug]` )

- Ordered list of all posts in the series
- Each entry shows the post number in the series, title, excerpt, and publication date

### Search ( `/search` )

- Search input field with URL-based query state
- Results fetched from `/api/search` using the MongoDB full-text index
- Results ranked by relevance score
- Up to 8 results returned, displayed in a post card grid

### Bookmarks ( `/bookmarks` )

- Client-side page — no server-side state
- Reads bookmark IDs stored in `localStorage` and fetches the corresponding posts
- Displays bookmarked posts in a grid or list view
- Individual bookmark removal from the page
- Empty state with a link to the blog listing

### Contact ( `/contact` )

- Contact form with fields: name, email, subject, and message
- Zod validation on the client and server
- Rate-limited at 3 submissions per hour per IP
- Submission stored in the Messages collection and an email notification sent to the admin

### About ( `/about` )

- Static page with site and author information

### RSS Feed ( `/feed.xml` )

- Auto-generated RSS 2.0 feed of all published posts
- Includes title, excerpt, link, author, category, and publication date per item
- Returns the 20 most recent published posts

### Sitemap and Robots

- `/sitemap.xml` — dynamically generated from the database; includes all published post slugs, category pages, tag pages, series pages, and author pages with appropriate priority and change frequency values
- `/robots.txt` — allows all public routes; disallows `/admin`, `/api`, and `/login`

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/semihkececioglu/pureblog)

1. Push the repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add all environment variables in the Vercel project settings under **Settings > Environment Variables**.
4. Set `NEXT_PUBLIC_APP_URL` to the production domain Vercel assigns or your custom domain.
5. Deploy — Vercel runs `pnpm build` automatically.

### Build Commands

| Command        | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| `pnpm dev`     | Start the development server at `http://localhost:3000`                  |
| `pnpm build`   | Create a production build                                                |
| `pnpm start`   | Start the production server                                              |
| `pnpm lint`    | Run ESLint across the project                                            |
| `pnpm analyze` | Build with bundle analyzer enabled — outputs client and server reports   |

### Self-Hosting

PureBlog can be deployed to any platform that supports Node.js. When deploying outside of Vercel, note the following:

**Cron jobs** — the `vercel.json` cron configuration is Vercel-specific. On other platforms, configure an external cron service (such as [cron-job.org](https://cron-job.org)) to send a `GET` request to `https://yourdomain.com/api/cron/publish` every hour with the header `Authorization: Bearer YOUR_CRON_SECRET`.

**Rate limiting** — the in-process rate limiter resets on every process restart. This is acceptable for single-instance deployments. For multi-replica or containerized environments, replace the in-process `Map` in `lib/rate-limit.ts` with a Redis-backed store.

---

## Cron Jobs

PureBlog uses a single Vercel cron job defined in `vercel.json`:

| Route                   | Schedule           | Description                                                                 |
| ----------------------- | ------------------ | --------------------------------------------------------------------------- |
| `/api/cron/publish`     | `0 * * * *` (hourly) | Publishes all posts whose `scheduledAt` date has passed and status is `draft` |

To use scheduled publishing, set a future publish date and time in the post editor and save the post with `draft` status. The cron job transitions it to `published` within the next hour and optionally sends a newsletter to active subscribers.

The endpoint requires a `CRON_SECRET` Bearer token. Vercel sends this header automatically on each cron invocation. To call the endpoint manually from an external scheduler:

```bash
curl -X GET https://yourdomain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## Author

**Semih Keçecioğlu**

- GitHub: [github.com/semihkececioglu](https://github.com/semihkececioglu)
- Twitter / X: [x.com/semihkececioglu](https://x.com/semihkececioglu)

If you find this project useful, consider giving it a star on [GitHub](https://github.com/semihkececioglu/pureblog).
