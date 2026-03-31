const express = require('express');
const router = express.Router();
const {
  getDraws, getLatestDraw, getDraw, getMyParticipation,
  adminGetAllDraws, adminCreateDraw, adminSimulateDraw, adminPublishDraw, adminUpdateDraw,
} = require('../controllers/drawController');
const { protect, adminOnly, requireSubscription } = require('../middleware/auth');

// Public
router.get('/',        getDraws);
router.get('/latest',  getLatestDraw);
router.get('/:id',     getDraw);

// Subscriber
router.get('/my/participation', protect, requireSubscription, getMyParticipation);

// Admin
router.get('/admin/all',            protect, adminOnly, adminGetAllDraws);
router.post('/admin/create',         protect, adminOnly, adminCreateDraw);
router.post('/admin/:id/simulate',   protect, adminOnly, adminSimulateDraw);
router.post('/admin/:id/publish',    protect, adminOnly, adminPublishDraw);
router.put('/admin/:id',             protect, adminOnly, adminUpdateDraw);

module.exports = router;
