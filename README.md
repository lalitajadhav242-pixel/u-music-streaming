# u music

Minimal scaffold for "u music" — a simple music upload, streaming, playlists, search, and auth app.

Quick start

1. Copy `.env.example` to `.env` and fill values (MongoDB, AWS S3, JWT secret).
2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
# backend
npm run dev

# frontend (in another terminal)
cd client
npm install
npm run dev
```

4. Build for production and serve from Express:

```bash
cd client
npm run build
# then start server (it will serve client/dist)
npm start
```

Notes

- Backend: Node.js + Express + MongoDB (mongoose).
- Storage: AWS S3 for music files.
- Frontend: React + Vite in `client/` (production build served from `client/dist`).
