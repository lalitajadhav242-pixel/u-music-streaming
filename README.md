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
npm run dev
```

4. Open the client at `client/index.html` (or serve it) and use the API at `http://localhost:4000/api`.

Notes

- Backend: Node.js + Express + MongoDB (mongoose).
- Storage: AWS S3 for music files.
- Frontend: Minimal HTML/JS at `client/` (replace with React later if desired).

Professional music &amp; podcast streaming platform
