# StudioSpace

**Live site:** https://studiospace-frontend-iota.vercel.app/

StudioSpace is a peer-to-peer marketplace where creators discover, compare and book photo studios, film stages, podcast lounges, music suites and workshops by the hour — and where hosts list and manage their own spaces.

## Features

- **Studio discovery** — browse a curated home page and the Explore page, search by name, city or amenity, filter by category (deep-linkable, e.g. `/studios?category=Music%20Suite`) and sort by newest or price.
- **Full studio CRUD** — create, view, edit and delete listings with image upload via imgbb (or a pasted image URL), amenities tags, pricing, capacity and read-only host information. Deletes go through a confirmation modal.
- **Rich studio pages** — image gallery, workspace specifications, amenities with icons, host profile, reviews and a sticky booking panel with a live price breakdown (subtotal + 10% service fee).
- **Booking workflow** — authenticated users request a slot, bookings start as **Pending**, and users can cancel a pending request. Hosts can **Confirm**, **Complete** or **Decline** requests from the dashboard.
- **Double-booking prevention** — the server rejects any new request that overlaps an existing **Confirmed** booking on the same studio and date, with a clear error message.
- **Authentication** — email/password registration and login plus Google OAuth, powered by Better Auth. Sessions are exchanged for an HTTPOnly signed JWT that protects studio and booking mutations.
- **Host dashboard** — live stats for listings, bookings, requests and confirmed earnings, plus the booking-request queue.
- **Polished UX** — responsive layout, light/dark theme remembered across visits, Swiper hero slider, skeleton loaders, Sonner toasts, accessible dialogs and a custom 404 page.

## Tech stack

- **Framework:** Next.js 16 (App Router, React Compiler) · React 19 · TypeScript
- **Styling/UI:** Tailwind CSS v4 (CSS-first) · shadcn `base-nova` on Base UI · Lucide icons · Swiper · Sonner
- **Auth:** Better Auth with the MongoDB adapter · signed HTTPOnly JWT cookies (`jose`)
- **Database:** MongoDB (native driver, shared client)
- **Media:** imgbb browser uploads
- **Deployment:** Vercel
- **API:** Next.js route handlers serve studio reads/CRUD plus booking create, list, cancel and status changes from MongoDB.

## Local setup

> Node.js 20+ and npm are required.

```bash
git clone https://github.com/sfjahin/StudioSpace.git
cd StudioSpace
npm ci
npm run seed     # one demo studio for each of the five featured categories
```

Create `.env.local` in the project root:

```bash
# Required
BETTER_AUTH_SECRET=replace-with-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
MONGODB_URI=mongodb://<user>:<password>@<cluster-host>/?retryWrites=true&w=majority

# Optional
MONGODB_DB=studiospace                 # defaults to "studiospace"
JWT_SECRET=replace-with-a-long-random-string   # falls back to BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID=...                   # enables Google sign-in
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_IMGBB_API_KEY=...          # enables file uploads (free key: https://api.imgbb.com)
```

Then run:

```bash
npm run dev
# open http://localhost:3000
```

Useful checks before submitting a change:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Examiner test credentials

Use this account on the live site (and locally against the same database):

| Role | Email | Password |
| --- | --- | --- |
| Host & guest | `wagajer251@en2ch.com` | `MayaChan123` |

The same account can act as both host and guest. Suggested walkthrough:

1. Sign in with the credentials above.
2. Explore `/studios`, search or filter by category, then open a studio.
3. Request a booking — note the live price breakdown and the **Pending** status under **My Bookings**.
4. Go to **Dashboard** and **Confirm** the request.
5. Request an overlapping slot on the same studio and date — the server should reject it.
6. Create your own listing from **Add New Studio**, then edit or delete it from **My Listings**.

Registration is also open if you prefer a fresh account.
