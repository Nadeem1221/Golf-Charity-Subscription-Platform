// ─── charityRoutes.js ────────────────────────────────────────────────────────
const express = require('express');
const charityRouter = express.Router();
const {
  getCharities, getCharity, createCharity, updateCharity, deleteCharity,
} = require('../controllers/charityController');
const { protect, adminOnly } = require('../middleware/auth');

charityRouter.get('/',           getCharities);
charityRouter.get('/:id',        getCharity);
charityRouter.post('/',          protect, adminOnly, createCharity);
charityRouter.put('/:id',        protect, adminOnly, updateCharity);
charityRouter.delete('/:id',     protect, adminOnly, deleteCharity);

module.exports = charityRouter;
