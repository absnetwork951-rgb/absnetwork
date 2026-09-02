<<<<<<< HEAD
# ABS Network Broadband SMC-Pvt-Ltd

A modern, production-grade Next.js 15 web platform and ISP portal for **ABS Network Broadband**, a high-speed fiber internet and enterprise networking equipment provider based in Islamabad, Pakistan.

> **Powered by**: [malikebad](https://github.com/malikebad)  
> **Contributor**: [malikebad](https://github.com/malikebad)

---

## 🚀 Overview

The platform features a public-facing website for broadband plans, IT/cloud services, and networking equipment commerce, paired with a role-based administrative management portal (RBAC).

- **Public Web Portal**: High-conversion landing pages, interactive broadband package selectors, networking/fiber optic equipment shop with cart/inquiry flow, service catalog, and contact/support inquiry forms.
- **Admin Management Panel**: Full-featured back-office for managing packages, services, shop catalog, incoming orders, contact submissions, user access control, and site configurations.
- **Self-Contained Data Layer**: In-memory cached file database (`data/abs_database.json`) with auto-seeding, zero external database setup required for local development, plus ready-to-deploy Supabase CMS migration support.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Motion (Framer Motion)](https://motion.dev/)
- **Icons & Typography**: [Lucide React](https://lucide.dev/), Inter & Modern sans-serif stack
- **Validation**: [Zod](https://zod.dev/) schemas
- **Authentication**: Custom session-based auth with `bcryptjs` password hashing & HTTP-only cookies
- **Email Delivery**: [Nodemailer](https://nodemailer.com/) (SMTP support with fallback)
- **Testing & Quality**: [Vitest](https://vitest.dev/) (Unit), [Playwright](https://playwright.dev/) (E2E), ESLint, TypeScript 5.9

---

## 📂 Project Structure

```text
absnetwork/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public pages (/, /packages, /services, /shop, /contact)
│   ├── admin/                  # Protected Admin panel (/admin/dashboard, /admin/shop, etc.)
│   ├── globals.css             # Tailwind 4 CSS tokens & custom utilities
│   ├── layout.tsx              # Root HTML layout & providers
│   ├── robots.ts / sitemap.ts  # Dynamic SEO routes
│   └── llms.txt                # AI/LLM crawler documentation
├── components/
│   ├── public/                 # Public UI components (Hero, Navbar, Footer, Cards)
│   └── admin/                  # Admin UI components (Data tables, forms, modals)
├── data/
│   └── abs_database.json       # Local database snapshot (auto-generated & seeded)
├── lib/
│   ├── actions/                # Server actions for mutations & form processing
│   ├── auth/                   # Session management, RBAC, permissions
│   ├── db/                     # Data layer (CRUD, queries, seeding, schema)
│   └── email/                  # Nodemailer contact form transport
├── scripts/                    # Maintenance, asset sync, SEO & probe scripts
├── supabase/                   # Supabase migration scripts & CMS definitions
└── tests/                      # Unit and E2E test suites
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later
- **Package Manager**: `npm`, `pnpm`, or `bun`

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd absnetwork
npm install
```

### 2. Environment Configuration

Copy the sample environment variables:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

| Variable | Description | Default / Example |
|---|---|---|
| `ADMIN_JWT_SECRET` | Secret key for signing admin session tokens | `abs_network_super_secure_session_key_2026` |
| `APP_URL` | Base canonical application URL | `http://localhost:3000` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini AI API key | `""` |
| `SMTP_HOST` | *(Optional)* SMTP host for contact inquiry emails | `mail.absnetwork.com.pk` |
| `SMTP_PORT` | *(Optional)* SMTP port (e.g. `587` or `465`) | `587` |
| `SMTP_USER` | *(Optional)* Mailbox username | `info@absnetwork.com.pk` |
| `SMTP_PASSWORD` | *(Optional)* Mailbox password (leave blank to log to DB only) | `""` |
| `CONTACT_RECEIVER` | Email recipient for public inquiries | `info@absnetwork.com.pk` |

> ℹ️ **Note on Email:** If `SMTP_PASSWORD` is omitted, emails will not be sent over network, but all form submissions will still be safely captured in the local database.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Portal & Default Credentials

The admin dashboard is accessible at `/admin/login`.

- **Default Admin Email**: `admin@absnetwork.pk`
- **Default Admin Password**: `AdminPassword@2026!`

### Role-Based Access Control (RBAC)

The system supports granular roles defined in `lib/auth/rbac.ts`:

- `SUPER_ADMIN`: Complete system access, user management, and settings
- `ADMIN`: Package, service, shop product, and order management
- `CONTENT_MANAGER`: Edit packages, services, shop catalog, and copy
- `SALES_MANAGER`: Process inquiries, manage shop products and order statuses
- `SUPPORT_AGENT`: Review contact submissions and support tickets
- `SECURITY_AUDITOR`: View-only access to audit logs and security events

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Webpack |
| `npm run build` | Builds the production bundle |
| `npm run start` | Runs the production Next.js server |
| `npm run lint` | Checks code with ESLint |
| `npm run test` | Runs unit test suite with Vitest |
| `npm run test:e2e` | Builds the standalone app and runs Playwright end-to-end tests |
| `npm run validate:seo` | Validates SEO meta tags, OpenGraph data, and sitemaps |
| `npm run clean` | Cleans `.next` and `out` build artifacts |

---

## 💾 Database & Resetting Data

The application stores live state in `data/abs_database.json`. 

- **Auto-Seed**: If `data/abs_database.json` does not exist on startup, it will automatically populate from `lib/db/seed.ts`.
- **Reset Database**: To reset the database to factory defaults, delete `data/abs_database.json` and restart the server.

---

## 👥 Contributors & Credits

- **Powered by**: [malikebad](https://github.com/malikebad)
- **Contributor & Maintainer**: [malikebad](https://github.com/malikebad)

---

## 📄 License

Proprietary software © ABS Network Broadband SMC-Pvt-Ltd. All rights reserved.

=======

>>>>>>> db05e473c8c3ac9b2c62b0aeb3972ad0c9c29e1d

