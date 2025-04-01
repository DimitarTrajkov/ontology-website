// routes/performance.js
const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.get('/trained_models/:dataset', performanceController.getAvailableModelsNamesForDataset);
router.get('/trained_params/:dataset/:model', performanceController.getAvailableParamsNamesForDatasetAndModel);
router.get('/trained_hyperparam_comb/:dataset/:model', performanceController.getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations);
router.get('/trained_hyperparams/:dataset/:model/:param', performanceController.getAvailableHyperParamNamesForDatasetModelAndParam);
router.get('/metrics/:dataset', performanceController.getAvailableMetricNamesByDataset);
router.get('/inner_hyperparam/all_metrics/:hyperparam', performanceController.getInnerPerformanceForHyperparamSet_AllMetrics);
router.get('/inner_hyperparam/avg_all_metrics/:hyperparam', performanceController.getInnerPerformanceForHyperparamSet_AllMetrics_AVG);
router.get('/inner_hyperparam/:mertric/:hyperparam', performanceController.getInnerPerformanceForHyperparamSetAndMetric);
router.get('/outter_results_my_model/:model/:metric', performanceController.getOutterPerformanceforMetricAndModel);
router.get('/:dataset/:metric', performanceController.getOutterPerformanceforMetricAndDataset);

module.exports = router;