// routes/info.js
const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');

router.get('/all/:dataset', infoController.getAllInfo);

module.exports = router;
