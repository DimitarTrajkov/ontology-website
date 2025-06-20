const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController');

router.get('/available_models/:dataset', experimentController.getAvailableModelsNamesForDataset);
router.get('/available_hyperparam/:dataset/:model', experimentController.getOneHyperParamNamesForDatasetAndModel);
router.get('/available_hyperparam_comb/:dataset/:model', experimentController.getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations);
router.get('/available_hyperparams/:dataset/:model/:param', experimentController.getAvailableHyperParamNamesForDatasetModelAndParam);
router.get('/available_datasets_filtered', experimentController.getAvailableDatasetsNames_Filtered);
router.get('/available_metrics/:dataset', experimentController.getAvailableMetricNamesByDataset);


router.get('/available_experiments/:dataset', experimentController.getAvailableExperimentForDataset);
router.get('/available_models_filtered/:type', experimentController.getAvailableModelsNames_Filtered);
router.get('/available_metrics_by_type/:type', experimentController.getMetricByTaskType);


module.exports = router;

