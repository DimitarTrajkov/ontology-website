const express = require('express');
const router = express.Router();
const innerController = require('../controllers/innerController');


//router.get('/inner_hyperparam/all_metrics/:hyperparam', performanceController.getInnerPerformanceForHyperparamSet_AllMetrics);
router.get('/hyperparam/all_metrics/:experiment', innerController.getInnerPerformanceForHyperparamSet_AllMetrics);  //#2

// router.get('/inner_hyperparam/avg_all_metrics/:hyperparam', performanceController.getInnerPerformanceForHyperparamSet_AllMetrics_AVG);
router.get('/hyperparam/avg_all_metrics/:experiment', innerController.getInnerPerformanceForHyperparamSet_AllMetrics_AVG);  //#3

// router.get('/inner_hyperparam/:mertric/:hyperparam', performanceController.getInnerPerformanceForHyperparamSetAndMetric);
router.get('/hyperparam/:mertric/:experiment', innerController.getInnerPerformanceForExperimentAndMetric); //#1
router.get('/all_hyperparam/all_metrics/:dataset', innerController.getInnerPerformanceByDataset);
router.get('/all_experiments', innerController.getInnerTestAveragePerformanceForAllExperiments);
router.get('/all_experiments/filtered', innerController.getInnerTestAveragePerformanceForAllExperiments_FilteredByMetricRange);

module.exports = router;
