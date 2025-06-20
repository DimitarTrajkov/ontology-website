// routes/datasets.js
const express = require('express');
const router = express.Router();
const MF_Controller = require('../controllers/metafeaturesController');

// router.get('/', MF_Controller.getDatasets);
router.get('/raw/:dataset', MF_Controller.getRawMetafeaturesForDataset);
router.get('/pre_processed/:dataset', MF_Controller.getPreProcessedmetafeaturesForDataset);

module.exports = router;