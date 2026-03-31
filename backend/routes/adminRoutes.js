const express = require('express');
const router = express.Router();
const {
  getAnalytics, getUsers, getUser, updateUser, adminEditUserScores,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/analytics',             getAnalytics);
router.get('/users',                 getUsers);
router.get('/users/:id',             getUser);
router.put('/users/:id',             updateUser);
router.put('/users/:id/scores',      adminEditUserScores);

module.exports = router;
