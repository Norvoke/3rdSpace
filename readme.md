# 3rdSpace

> Your space. Your rules. No algorithms. No ads. Just people.

A modern MySpace-inspired social network built with Node.js, Express, React, and MongoDB.

## Stack

- **Frontend**: React + TypeScript + Vite, React Query, Zustand, React Router
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (via Mongoose)
- **Auth**: Google OAuth 2.0 + JWT
- **Styling**: CSS Modules with custom design system

## Features

- ✅ Google OAuth sign-in
- ✅ Chronological feed (zero algorithmic ranking)
- ✅ User profiles with custom CSS, HTML, mood, bio, song
- ✅ Wall posts & comments
- ✅ Friend requests & connections
- ✅ Profile search
- ✅ Private profiles

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourname/3rdSpace.git
cd 3rdSpace
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example server/.env
# Fill in your values
```

Required env vars:
- `MONGODB_URI` — MongoDB Atlas connection string
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `JWT_SECRET` — a long random string
- `SESSION_SECRET` — another long random string

### 3. Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`

### 4. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## URL Structure

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/feed` | Chronological friend feed |
| `/~username` | User profile |
| `/edit-profile` | Edit your profile |
| `/search` | Find people |

## Profile Customization

Users can customize their profiles with:
- **Custom CSS** — full stylesheet injected on their profile page
- **Custom HTML** — "About Me" section rendered as raw HTML
- **Profile song** — SoundCloud/YouTube embed
- **Mood** — current vibe
- **Header image** — banner image URL

## Philosophy

3rdSpace enforces chronological-only feeds at the database level. Posts are always sorted by `createdAt: -1`. There are no scores, weights, or engagement metrics — ever.
