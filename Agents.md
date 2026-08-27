# Agents.md - ABS Network Broadband Codebase Guide

## Project Overview
ABS Network Broadband SMCVP Pvt Ltd - A Next.js 15 ISP website for a fiber broadband company in Islamabad, Pakistan. Features public-facing broadband packages, services, fiber/networking equipment shop, and a full admin panel with RBAC.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **TypeScript**: 5.9
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Auth**: bcryptjs, custom session-based
- **Icons**: lucide-react
- **Animations**: motion (framer-motion)
- **Database**: JSON file on disk (`data/abs_database.json`)
- **No external DB, no Prisma, no ORM**

## Architecture

### Data Layer
- **Database**: `data/abs_database.json` - Single JSON file with in-memory cache
- **Read/Write**: `lib/db/index.ts` - All database operations via `fs.readFileSync`/`fs.writeFileSync`
- **Types**: `lib/db/types.ts` - All TypeScript interfaces
- **Seed**: `lib/db/seed.ts` - Initial data (runs when DB file doesn't exist)
- **Migration**: `lib/db/index.ts:47-61` - Auto-migrates old `solarProducts`/`solarOrders` keys

### Server Actions
All mutations use Next.js server actions in `lib/actions/`:
- `auth.ts` - Login/logout
- `admin-shop.ts` - Shop product CRUD
- `admin-solar.ts` - Redirects to admin-shop (backward compat)
- `admin-packages.ts` - Broadband package CRUD
- `admin-services.ts` - Service CRUD
- `admin-settings.ts` - Site settings
- `admin-orders.ts` - Order management
- `admin-submissions.ts` - Contact submission management
- `admin-users.ts` - Admin user management
- `public-forms.ts` - Public contact form and shop inquiry

### Auth & RBAC
- **Session**: Token-based in cookie, stored in DB sessions array
- **Roles**: SUPER_ADMIN, ADMIN, CONTENT_MANAGER, SALES_MANAGER, SUPPORT_AGENT, SECURITY_AUDITOR
- **Guards**: `lib/auth/session.ts` - `requireAuth()`, `requireRole()`, `requirePermission()`
- **Seed Credentials**: `admin@absnetwork.pk` / `AdminPassword@2026!`

### Database Schema Keys
```
settings, users, sessions, packages, services, shopProducts,
contactSubmissions, shopOrders, auditLogs, securityEvents
```

### Key Data Types
- `ShopProduct` - Fiber/networking equipment (categories: network_cables, fiber_optics, routers, network_switches, etc.)
- `BroadbandPackage` - ISP packages (categories: residential, business, gaming, enterprise)
- `ServiceItem` - Company services (categories: broadband, enterprise, it, cloud, support)
- `ContactSubmission` - Public form submissions
- `ShopInquiryOrder` - Equipment shop orders/inquiries
- `AdminUser` - Admin accounts with roles
- `SiteSettings` - All site configuration

## Running the App
```bash
npm install
npm run dev     # Development (http://localhost:3000)
npm run build   # Production build
npm start       # Production server
```

## Important Conventions

### Currency
All prices in PKR (Pakistani Rupees). Fields use `Pkr` suffix: `pricePkr`, `salePricePkr`, `installationFeePkr`.

### Component Organization
- `components/public/` - Public-facing components
- `components/admin/` - Admin panel components
- `app/` - Next.js App Router pages
- `hooks/` - Custom React hooks

### Server Components vs Client Components
- Pages are server components (fetch data via `lib/db` functions)
- Interactive components use `'use client'` directive
- Mutations go through server actions (never direct DB access from client)

### Styling
Tailwind CSS 4 utility classes throughout. Design system:
- **Colors**: Blue-600 primary (#2563EB), slate-900 text (#0F172A), blue-50 backgrounds
- **Border Radius**: `rounded-2xl` cards, `rounded-xl` inputs/buttons, `rounded-lg` badges
- **Shadows**: `shadow-xs` subtle, `shadow-xl` elevated, `shadow-2xl` modals
- **Borders**: `border-slate-200/90` standard, `border-blue-500` active states
- **Animation**: `animate-pulse` live indicators, framer-motion for page transitions
- **Design Tokens**: CSS custom properties defined in `app/globals.css` via `@theme` block
- **Key Classes**: `.btn-primary`, `.btn-secondary`, `.input-base`, `.badge-blue`, `.card-hover`, `.glass`, `.text-gradient-blue`

### Currency Display
Always format PKR with `toLocaleString()`: `PKR {amount.toLocaleString()}`

## Common Tasks

### Adding a New Shop Product Category
1. Add to `ShopProductCategory` union in `lib/db/types.ts`
2. The admin form and shop filter will auto-detect

### Modifying Broadband Packages
- Edit `lib/db/seed.ts` for seed data changes
- Edit `lib/actions/admin-packages.ts` for CRUD logic
- Edit `components/admin/PackagesManagerClient.tsx` for admin UI

### Adding New Admin Roles
1. Add to `AdminRole` type in `lib/db/types.ts`
2. Add permissions mapping in `lib/auth/rbac.ts`
3. Update role descriptions in `components/admin/UsersManagerClient.tsx`

### Database Reset
Delete `data/abs_database.json` and restart the app. Seed data will be re-initialized from `lib/db/seed.ts`.

## File Reference

### Critical Files
| File | Purpose |
|------|---------|
| `data/abs_database.json` | Live database (all data) |
| `lib/db/index.ts` | All DB operations + migration |
| `lib/db/types.ts` | All TypeScript interfaces |
| `lib/db/seed.ts` | Initial seed data |
| `lib/auth/rbac.ts` | Role-based access control |
| `lib/auth/session.ts` | Session management |
| `lib/actions/public-forms.ts` | Public form submissions |

### Pages
| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Homepage |
| `/shop` | Public | Fiber & networking equipment catalog |
| `/packages` | Public | Broadband packages |
| `/services` | Public | Company services |
| `/contact` | Public | Contact form + FAQ |
| `/solar-packages` | Redirect | → `/shop` |
| `/admin/login` | Public | Admin login |
| `/admin/dashboard` | Admin | Dashboard metrics |
| `/admin/shop` | Admin | Shop product management |
| `/admin/packages` | Admin | Package management |
| `/admin/services` | Admin | Service management |
| `/admin/orders` | Admin | Shop order management |
| `/admin/contact-submissions` | Admin | Contact submissions |
| `/admin/settings` | Admin | Site settings |
| `/admin/users` | Admin | Admin user management |
| `/admin/solar` | Redirect | → `/admin/shop` |
