const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController');

router.get('/available_models/:dataset', experimentController.getAvailableModelsNamesForDataset);
router.get('/available_hyperparam/:dataset/:model', experimentController.getOneHyperParamNamesForDatasetAndModel);
router.get('/available_hyperparam_comb/:dataset/:model', experimentController.getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations);
router.get('/available_hyperparams/:dataset/:model/:param', experimentController.getAvailableHyperParamNamesForDatasetModelAndParam);
router.get('/available_datasets_filtered', experimentController.getAvailableDatasetsNames_Filtered);
router.get('/available_models_filtered', experimentController.getAvailableModelsNames_Filtered);
router.get('/available_metrics/:dataset', experimentController.getAvailableMetricNamesByDataset);


module.exports = router;

