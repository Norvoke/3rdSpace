# 3rdSpace

> Your space. Your rules. No algorithms. No ads. Just people.

A MySpace-style social network, built because the internet used to feel like this and doesn't anymore. Node, Express, React, MongoDB.

## Stack

- Frontend: React + TypeScript + Vite, React Query, Zustand, React Router
- Backend: Node.js + Express + TypeScript
- Database: MongoDB (via Mongoose)
- Auth: Google OAuth 2.0 + JWT
- Styling: CSS Modules, hand-rolled design system

## Features

- Google OAuth sign-in
- Chronological feed, no ranking, no algorithm
- Profiles you can actually mess with: custom CSS, custom HTML, mood, bio, banner color/pattern
- Wall posts and comments, with photo/gif uploads
- Friend requests and connections
- Groups
- Profile search
- Private profiles

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/yourname/3rdSpace.git
cd 3rdSpace
npm run install:all
```

### 2. Configure environment

```bash
cp env.example server/.env
# fill in your values
```

Required env vars:
- `MONGODB_URI` - MongoDB Atlas connection string
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` - from Google Cloud Console
- `JWT_SECRET` - a long random string
- `SESSION_SECRET` - another long random string
- `UPLOADS_DIR` - only needed in production if you're on something like Railway with an ephemeral filesystem; point it at a mounted volume or uploaded images vanish on every redeploy

### 3. Set up Google OAuth

1. Go to console.cloud.google.com
2. Create a project, then APIs & Services -> Credentials
3. Create an OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`

### 4. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## URL structure

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/feed` | Chronological friend feed |
| `/wall` | Public wall, everyone posts here |
| `/groups` | Browse groups |
| `/groups/:slug` | A group's page |
| `/post/:postId` | A single post, linked to from notifications |
| `/u/:username` | User profile |
| `/edit-profile` | Edit your profile |
| `/search` | Find people |

## Profile customization

MySpace-era profile customization, kept as safe as it can be without gutting the point of it:

- Custom CSS, injected on the profile page
- Custom HTML "About Me" section, sanitized server-side so it can't be turned into a phishing page
- Mood, bio, interests
- Banner: pick a background color, and optionally tile one of the [heropatterns.com](https://heropatterns.com) patterns over it in a color of your choice
- Profile picture with a crop tool on upload

## Philosophy

Chronological only, enforced at the database level. Posts are always sorted by `createdAt: -1`. No scores, no weights, no engagement metrics, ever. If people want an algorithm they know where to find one.
