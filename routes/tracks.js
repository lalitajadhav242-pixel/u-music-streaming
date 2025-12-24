const express = require('express');
const multer = require('multer');
const { s3, BUCKET } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const Track = require('../models/Track');
const jwt = require('jsonwebtoken');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const express = require('express');
const multer = require('multer');
const { s3, BUCKET } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const Track = require('../models/Track');
const jwt = require('jsonwebtoken');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

router.post('/upload', auth, upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file' });
    const key = `${uuidv4()}-${file.originalname}`;
    await s3.upload({ Bucket: BUCKET, Key: key, Body: file.buffer, ContentType: file.mimetype }).promise();
    const track = await Track.create({ title: req.body.title || file.originalname, artist: req.body.artist || '', s3Key: key, mimeType: file.mimetype, size: file.size, uploadedBy: req.userId });
    res.json(track);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q;
    let filter = {};
    if (q) filter = { $or: [{ title: new RegExp(q, 'i') }, { artist: new RegExp(q, 'i') }] };
    const tracks = await Track.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(tracks);
  } catch (err) { next(err); }
});

// Stream with HTTP Range support for seeking (works with HTML5 audio)
router.get('/:id/stream', async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Not found' });

    // Get object metadata to know total size
    const head = await s3.headObject({ Bucket: BUCKET, Key: track.s3Key }).promise();
    const total = head.ContentLength;
    const contentType = track.mimeType || head.ContentType || 'audio/mpeg';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunkSize = (end - start) + 1;

      const s3Stream = s3.getObject({ Bucket: BUCKET, Key: track.s3Key, Range: `bytes=${start}-${end}` }).createReadStream();
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });
      s3Stream.pipe(res).on('error', next);
    } else {
      const s3Stream = s3.getObject({ Bucket: BUCKET, Key: track.s3Key }).createReadStream();
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      s3Stream.pipe(res).on('error', next);
    }
  } catch (err) { next(err); }
});

module.exports = router;
