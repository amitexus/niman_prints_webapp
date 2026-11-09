# Niman Prints — Business OS

A fresh, standalone Niman Prints application. This project is independent of Bizzne.

## Current milestone

- Premium dark-mode admin dashboard
- Responsive sidebar navigation
- KPI cards, revenue visualization and order-status overview
- Searchable recent-orders table
- Activity feed and AI Studio placeholder
- Clearly labelled demo data (no live business records yet)

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build for production

```bash
npm run build
npm start
```

## Project structure

```text
app/              Next.js App Router, global styles and root page
components/       Dashboard and sidebar UI
lib/              Demo data (replace with API/database data later)
```

## Next milestones

1. Replace demo data with FastAPI endpoints and MongoDB persistence.
2. Add authentication, roles and secure business settings.
3. Implement orders, products, customers, production, inventory and finance modules.
4. Add storefront, checkout and order tracking.
5. Integrate AI assistant and event-driven automations.

Do not use the sample dashboard numbers for accounting or business decisions.
