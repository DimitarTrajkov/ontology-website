// routes/radar.js
const express = require('express');
const router = express.Router();
const radarController = require('../controllers/radarController');

router.get('/:model', radarController.getRadarData);

module.exports = router;