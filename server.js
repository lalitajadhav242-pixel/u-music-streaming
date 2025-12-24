const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tracksRoutes = require('./routes/tracks');
const playlistsRoutes = require('./routes/playlists');

dotenv.config();

const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve production build if available, otherwise serve client/ for development
const distPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(path.join(__dirname, 'client')));
}

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

app.use('/api/auth', authRoutes);
app.use('/api/tracks', tracksRoutes);
app.use('/api/playlists', playlistsRoutes);

// Fallback to index.html for SPA routes (but keep API routes as JSON 404)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  const file = fs.existsSync(distPath) ? path.join(distPath, 'index.html') : path.join(__dirname, 'client', 'index.html');
  res.sendFile(file);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
