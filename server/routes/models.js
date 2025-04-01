// routes/models.js
const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

router.get('/experiments/', modelController.getFilteredExperiments);
router.get('/:dataset/:model', modelController.getModelData);

module.exports = router;

