// routes/datasets.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// used in info page
router.get('/models/:dataset', searchController.getTrainedModelsForDataset);
router.get('/:dataset', searchController.getFullInfoForDataset);
// use in ListPage (library)
router.get('/', searchController.getAllDatasets);

module.exports = router;   