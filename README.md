# 📣 SocialFeed — Full-Stack Social Media App

A modern, mobile-first social media application built with **React + Node.js + MongoDB**.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, MUI v5 |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT via httpOnly Cookies |
| Media | Cloudinary (image uploads) |
| Styling | MUI System + Inter font |

## ✨ Features

- 🔐 **Secure Auth** — JWT stored in httpOnly cookies (XSS-safe)
- 📰 **Paginated Feed** — cursor-based pagination with infinite scroll
- ❤️ **Like / Unlike** — toggle with real-time count update
- 💬 **Comments** — nested comment threads per post
- 📷 **Image Uploads** — via Cloudinary with auto-optimization
- 🔔 **Notifications** — likes and comments on your posts
- 🌙 **Dark Mode** — auto-detects system preference, togglable
- 📱 **Fully Responsive** — mobile, tablet, desktop
- 🔍 **Live Search** — filter posts by text or username

## 📁 Project Structure

```
3W/
├── backend/
│   ├── index.js           # Express app entry
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   └── routes/
│       ├── auth.js           # /api/auth (login, signup, logout, me)
│       └── posts.js          # /api/posts (CRUD, like, comment)
└── frontend/mini-social-app/
    ├── src/
    │   ├── api/axios.js      # Axios instance with cookie support
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── hooks/
    │   │   ├── usePosts.js      # Paginated post fetching hook
    │   │   └── useNotifications.js
    │   ├── components/
    │   │   ├── PostCard.jsx
    │   │   ├── CreatePostBox.jsx
    │   │   ├── NotificationDrawer.jsx
    │   │   ├── InfiniteScrollTrigger.jsx
    │   │   └── EmptyState.jsx
    │   └── pages/
    │       ├── Feed.jsx
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── Profile.jsx
    │       └── CreatePost.jsx
    └── vite.config.js
```

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB URI
- Cloudinary account

### Backend Setup
```bash
cd backend
npm install
```
Create `.env`:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
NODE_ENV=development
```
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend/mini-social-app
npm install
npm run dev
```

App runs at `http://localhost:5173` → proxied to backend at `http://localhost:5000`.

## 📚 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | — | Logout (clears cookie) |
| GET | `/api/auth/me` | Cookie | Get current user |
| GET | `/api/posts?limit=10&cursor=` | — | Paginated posts |
| POST | `/api/posts` | ✅ | Create post |
| POST | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/comment` | ✅ | Add comment |
