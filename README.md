<div align="center">

# 🌐 3W — Mini Social Post App

**A full-stack social feed application built for the TripleW Solutions internship assignment.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![MUI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io)](https://socket.io)

### 🔗 Live Demo

| | Link |
|---|---|
| 🌍 **Frontend** | [https://3-w-sigma.vercel.app](https://3-w-sigma.vercel.app) |
| ⚙️ **Backend** | [https://threew-fixf.onrender.com](https://threew-fixf.onrender.com) |
| 📦 **Repository** | [https://github.com/Ronin-yashu/3W](https://github.com/Ronin-yashu/3W) |

</div>

---

## ✨ Features

### Core (Assignment Requirements)
- 🔐 **Auth** — Signup & Login with JWT (stored in HTTP-only cookies)
- 📝 **Create Post** — Text, image, or both (image upload via Cloudinary)
- 🌍 **Public Feed** — All users' posts in a paginated, cursor-based feed
- ❤️ **Like** — Toggle like with optimistic UI update
- 💬 **Comment** — Add comments with emoji picker support
- 👤 **Profile** — View your posts, total likes & comments stats

### Bonus (Extra Credit)
- ⚡ **Real-time updates** via Socket.io — likes, comments, new posts & deletes broadcast instantly across all connected clients
- 📄 **Cursor-based pagination** — infinite scroll with `Load More`
- 🌙 **Dark / Light mode** toggle
- ✏️ **Edit post** — inline text editor (owner only)
- 🗑️ **Delete post** — real-time broadcast to all clients (owner only)
- 😊 **Emoji picker** in comment input
- 📱 **Fully responsive** — mobile-first design with MUI breakpoints
- 🔔 **New post banner** — polls every 5s for new posts, shows refresh banner only when new content actually exists
- 🖼️ **Smart image rendering** — portrait/landscape detection for optimal display
- 🧩 **Reusable hooks** — `usePosts`, `useSocket` for clean separation of concerns
- 🛡️ **Error boundaries** for graceful UI fallbacks

---

## 🗂️ Project Structure

```
3W/
├── backend/
│   ├── index.js              # Express server + Socket.io setup
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   ├── models/
│   │   ├── User.js           # User schema (username, email, password)
│   │   └── Post.js           # Post schema (text, imageUrl, likes, comments)
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/signup, /login, /logout, /me
│   │   └── posts.js          # GET/POST/PATCH/DELETE /api/posts + like/comment
│   └── package.json
│
└── frontend/mini-social-app/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance with base URL + credentials
    │   ├── components/
    │   │   └── PostCard.jsx      # Post card: like, comment, edit, delete, emoji
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state (user, login, logout)
    │   ├── hooks/
    │   │   ├── usePosts.js       # Feed state, WebSocket listeners, polling
    │   │   └── useSocket.js      # Singleton Socket.io connection
    │   ├── pages/
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Signup.jsx        # Signup page
    │   │   ├── Feed.jsx          # Main feed with create-post + infinite scroll
    │   │   └── Profile.jsx       # User profile with stats + post list
    │   ├── App.jsx               # Routes + dark mode state
    │   └── main.jsx
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| UI Library | Material UI (MUI) v5 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + HTTP-only cookies |
| Image Upload | Cloudinary |
| Deployment | Vercel (FE) + Render (BE) + MongoDB Atlas |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/Ronin-yashu/3W.git
cd 3W
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev   # starts on port 5000
```

### 3. Frontend setup
```bash
cd frontend/mini-social-app
npm install
npm run dev   # starts on port 5173
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, sets JWT cookie |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Get current user |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts?limit=10&cursor=` | Paginated feed |
| POST | `/api/posts` | Create post (multipart/form-data) |
| PATCH | `/api/posts/:id` | Edit post text (owner only) |
| DELETE | `/api/posts/:id` | Delete post (owner only) |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |

### WebSocket Events
| Event | Direction | Payload |
|---|---|---|
| `post:new` | Server → Client | New post object |
| `post:updated` | Server → Client | Updated post object |
| `post:deleted` | Server → Client | Deleted post `_id` |

---

## 📦 MongoDB Collections

Only **2 collections** as required:

**users**
```json
{ "username": "", "email": "", "password": "<bcrypt hash>" }
```

**posts**
```json
{
  "userId": "",
  "username": "",
  "text": "",
  "imageUrl": "",
  "likes": [{ "userId": "", "username": "" }],
  "comments": [{ "userId": "", "username": "", "text": "", "createdAt": "" }]
}
```

---

## 🌍 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [https://3-w-sigma.vercel.app](https://3-w-sigma.vercel.app) |
| Backend | Render | [https://threew-fixf.onrender.com](https://threew-fixf.onrender.com) |
| Database | MongoDB Atlas | — |
| Images | Cloudinary | — |

---

## 👨‍💻 Author

Built with ❤️ by **Yash** for the **3W Solutions Full Stack Internship Assignment**.
