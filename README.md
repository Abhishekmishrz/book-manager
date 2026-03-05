# Bookshelf — Personal Book Manager

A full-stack MERN application with Next.js 14 for managing your personal reading life.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) |
| Data Fetching | SWR + Axios |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

## Features

- **Auth** — Sign up, log in, persistent sessions via httpOnly JWT cookies
- **Book Library** — Add, edit, delete, search, filter and sort your book collection
- **5 Reading Statuses** — Want to Read / Reading / Completed / Paused / Dropped
- **Open Library Integration** — Search by title to auto-fill cover, author, pages, year, ISBN
- **Star Ratings & Reviews** — Rate and review your books privately
- **Tags & Favourites** — Flexible tagging and a favourites shelf
- **Bookmarkable Filters** — All filter/search state synced to URL
- **Reading Statistics** — Monthly bar chart, genre donut, reading streak heatmap, goal progress ring
- **Author Insights** — Aggregated author cards with avg rating and genre breakdown
- **Settings** — Update profile, set annual reading goal, change password, delete account

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Backend

```bash
cd server
npm install
cp .env.example .env       # Edit JWT_SECRET and MONGO_URI as needed
npm run dev                # Runs on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
# .env.local is already created — NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev                # Runs on http://localhost:3000
```

### Quick Start (both at once)

Open two terminals:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
Assigment/
├── server/              # Express + MongoDB API
│   └── src/
│       ├── models/      # User, Book
│       ├── controllers/ # Auth, Book
│       ├── routes/      # /api/auth, /api/books, /api/stats
│       ├── middleware/  # JWT auth, error handler
│       └── services/    # Stats aggregation pipelines
│
└── client/              # Next.js 14 frontend
    ├── app/             # App Router pages
    ├── components/      # UI, layout, books, stats, authors
    ├── hooks/           # SWR data hooks
    ├── lib/             # Axios instance, utilities
    └── types/           # Shared TypeScript types
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Log in |
| POST | /api/auth/logout | Log out |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/me | Update profile |
| DELETE | /api/auth/me | Delete account |

### Books
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/books | List books (filterable, paginated) |
| POST | /api/books | Add book |
| GET | /api/books/:id | Get single book |
| PATCH | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |
| PATCH | /api/books/:id/status | Quick status update |
| PATCH | /api/books/:id/favourite | Toggle favourite |

### Stats
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/stats/overview | Totals by status, avg rating, pages |
| GET | /api/stats/monthly | Books per month (current year) |
| GET | /api/stats/genres | Genre breakdown |
| GET | /api/stats/authors | Per-author aggregation |
| GET | /api/stats/streak | Weekly reading activity |

## Design System

Dark theme with violet accent — `#7C3AED`. Key tokens:

```
Background: #0A0A0F  |  Surface: #13131A   |  Accent: #7C3AED
Success:    #059669  |  Warning: #D97706   |  Danger: #DC2626
```
