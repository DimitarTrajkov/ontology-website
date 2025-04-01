// routes/table.js
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.get('/outter_data/:dataset', tableController.getOutterPerformanceByDataset);
router.get('/all_experiments', tableController.getInnerTestAveragePerformanceForAllExperiments);
router.get('/all_experiments_range_filtered', tableController.getInnerTestAveragePerformanceForAllExperiments_FilteredByMetricRange);
router.get('/all_datasets', tableController.getAvailableDatasetsNames_Filtered);
router.get('/all_models_filtered', tableController.getAvailableModelsNames_Filtered);
router.get('/inner_data/:dataset', tableController.getInnerPerformanceByDataset);


module.exports = router;