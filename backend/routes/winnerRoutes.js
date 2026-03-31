const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getMyWinnings, uploadProof,
  adminGetAllWinners, adminVerifyWinner, adminMarkPaid,
} = require('../controllers/winnerController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Multer config for proof screenshots ─────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads/proofs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof-${req.user._id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(valid ? null : new Error('Only image files allowed'), valid);
  },
});

// Subscriber routes
router.get('/my',                    protect, getMyWinnings);
router.post('/:id/upload-proof',     protect, upload.single('proof'), uploadProof);

// Admin routes
router.get('/admin/all',             protect, adminOnly, adminGetAllWinners);
router.put('/admin/:id/verify',      protect, adminOnly, adminVerifyWinner);
router.put('/admin/:id/mark-paid',   protect, adminOnly, adminMarkPaid);

module.exports = router;
