const express = require('express');
const router = express.Router();
const outterController = require('../controllers/outterController');

router.get('/by_model/:model/:metric', outterController.getOutterPerformanceforMetricAndModel);
router.get('/by_dataset/:dataset/:metric', outterController.getOutterPerformanceforMetricAndDataset);
router.get('/by_dataset/all_metrics/:dataset', outterController.getOutterPerformanceByDataset);

module.exports = router;

