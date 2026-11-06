# StudioSpace — Peer-to-Peer Creative Workspace Platform

**Live site:** https://your-studiospace-client.vercel.app  *(replace with your deployed URL)*
**API server:** https://your-studiospace-server.vercel.app  *(replace with your deployed URL)*

StudioSpace is a marketplace where creators discover, compare and book photo studios, film stages, podcast lounges, music suites and workshops by the hour, and where hosts list and manage their spaces.

## Features

- **Studio CRUD** — add, view, edit and delete listings with image upload (imgbb), amenities tags and read-only host info; deletes go through a confirmation modal.
- **Explore & filter** — search by name, city or amenity, filter by category (deep-linkable: `/studios?category=Music%20Suite`) and sort by price.
- **Booking system** — price breakdown with service fee, bookings saved as `Pending`, status badges and cancel-while-pending.
- **Double-booking prevention** — the server rejects any request that overlaps an existing *Confirmed* booking on the same studio and date, with a clear message.
- **Host dashboard** — stats plus booking requests where hosts Confirm, Complete or Decline.
- **Light / dark theme** — one toggle in the navbar, remembered across visits, no flash on load.
- **Polish** — Swiper hero slider, skeleton loaders, custom 404, friendly empty states, Sonner toasts and modal dialogs (no `alert()`), fully responsive.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui + Base UI · Swiper · Sonner · Lucide icons
Server: Express 5 · MongoDB (native driver) · deployed on Vercel

## Local setup

```bash
git clone <client-repo-url> studiospace && cd studiospace
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_IMGBB_API_KEY=<your imgbb key>" >> .env.local    # free key: api.imgbb.com
npm run dev      # http://localhost:3000
```

Start the API first (see the server repo README), then verify with `npm run lint`, `npx tsc --noEmit` and `npm run build`.

## Examiner access

Sign-in is not enabled in this build. Every private route (`/dashboard`, `/add-studio`, `/my-listings`, `/my-bookings`, `/studios/edit/[id]`) is open and acts as the demo host:

| Name | Email |
| --- | --- |
| Maya Chen | maya@example.com |

To test double-booking: create a studio, book a slot, open **Dashboard → Confirm**, then book an overlapping time on the same date.
