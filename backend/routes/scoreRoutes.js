const express = require('express');
const router = express.Router();
const { getMyScores, addScore, editScore, deleteScore } = require('../controllers/scoreController');
const { protect, requireSubscription } = require('../middleware/auth');

router.use(protect, requireSubscription);

router.get('/my',                getMyScores);
router.post('/add',              addScore);
router.put('/edit/:index',       editScore);
router.delete('/delete/:index',  deleteScore);

module.exports = router;
