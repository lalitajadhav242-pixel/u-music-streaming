const express = require('express');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const jwt = require('jsonwebtoken');

const router = express.Router();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid token' }); }
}

router.post('/', auth, async (req, res, next) => {
  try {
    const { name } = req.body;
    const pl = await Playlist.create({ name, user: req.userId, tracks: [] });
    res.json(pl);
  } catch (err) { next(err); }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const pls = await Playlist.find({ user: req.userId }).populate('tracks');
    res.json(pls);
  } catch (err) { next(err); }
});

router.post('/:id/add', auth, async (req, res, next) => {
  try {
    const { trackId } = req.body;
    const pl = await Playlist.findOne({ _id: req.params.id, user: req.userId });
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (!pl.tracks.includes(trackId)) pl.tracks.push(trackId);
    await pl.save();
    res.json(pl);
  } catch (err) { next(err); }
});

router.post('/:id/remove', auth, async (req, res, next) => {
  try {
    const { trackId } = req.body;
    const pl = await Playlist.findOne({ _id: req.params.id, user: req.userId });
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    pl.tracks = pl.tracks.filter(t => t.toString() !== trackId);
    await pl.save();
    res.json(pl);
  } catch (err) { next(err); }
});

module.exports = router;
