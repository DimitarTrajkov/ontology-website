/**
 * @swagger
 * tags:
 *   - name: Experiment Queries
 *     description: Endpoints for retrieving experiment data.(dataset names, model names, hyperparameter names, metric names etc.)
 * /exepriemnts/available_models/{dataset}:
 *   get:
 *     summary: Fetches all available models for a specific dataset.
 *     description: Fetches all available models for a specific dataset.
 *     tags:
 *       - Experiment Queries
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: Name of the dataset you want to get the models for.
 *     responses:
 *       200:
 *         description: Successfully retrieved inner performance data for the specified hyperparameter across all metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   model_name:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "LOGREG"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected response from Virtuoso"
 */
const getAvailableModelsNamesForDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT DISTINCT ?model_name
      FROM <http://localhost:8890/test03>
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (
              regex(?evaluationMeasure_label, "${dataset}")
              && regex(?evaluationMeasure_label, "outter")
          )

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model_name)
      }
      `;
  
      const results = await client.query(query).execute();
      
      if (!results || !results.results || !results.results.bindings) {
        console.error("Invalid SPARQL response:", results);
        return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
  
      res.json(results.results.bindings);
    } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
    }
  };




/**
 * @swagger
 * tags:
 *   - name: Experiment Queries
 *     description: Endpoints for retrieving experiment data.(dataset names, model names, hyperparameter names, metric names etc.)
 * /exepriemnts/available_hyperparam/{dataset}/{model}:
 *   get:
 *     summary: Fetches one available hyperparameter combination for a specific dataset and model.
 *     description: Fetches one available hyperparameter combination for a specific dataset and model, With the purpose to extract the hyperparameter names for the specific model on given dataset.
 *     tags:
 *       - Experiment Queries
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: Name of the dataset you want to get the hyperparameters for.
 *       - name: model
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "LOGREG"
 *         description: Name of the model you want to get the hyperparameters for.
 *     responses:
 *       200:
 *         description: Successfully retrieved inner performance data for the specified hyperparameter across all metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   param_string:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "_C=10_solver=sag_max_iter=400"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected response from Virtuoso"
 */
const getOneHyperParamNamesForDatasetAndModel = async (req, res) => {
    const { dataset, model } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT DISTINCT ?param_string
      FROM <http://localhost:8890/test03>
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (
              regex(?evaluationMeasure_label, "${dataset}_${model}_")
              && regex(?evaluationMeasure_label, "_outter_")
          )

          # Extract parameter string (everything between ${dataset}_${model}_ and _outter_)
          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_outter_") AS ?param_string)
      } LIMIT 1
      `;
  
      const results = await client.query(query).execute();
      
      if (!results || !results.results || !results.results.bindings) {
        console.error("Invalid SPARQL response:", results);
        return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
  
      res.json(results.results.bindings);
    } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
    }
  };


/**
 * @swagger
 * tags:
 *   - name: Experiment Queries
 *     description: Endpoints for retrieving experiment data.(dataset names, model names, hyperparameter names, metric names etc.)
 * /exepriemnts/available_hyperparams/{dataset}/{model}/{param}:
 *   get:
 *     summary: Fetches all available hyperparameter values for a given hyperparameter in a given dataset and model.
 *     description: Fetches all available hyperparameter values for a given hyperparameter in a given dataset and model.
 *     tags:
 *       - Experiment Queries
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: Name of the dataset you want to get the hyperparameter values for.
 *       - name: model
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "LOGREG"
 *         description: Name of the model you want to get the hyperparameter values for.
 *       - name: param
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "C"
 *         description: Name of the hyperparamter you want to get the hyperparameter values for.
 *     responses:
 *       200:
 *         description: Successfully retrieved inner performance data for the specified hyperparameter across all metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hyper_param_val:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "100"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected response from Virtuoso"
 */
  const getAvailableHyperParamNamesForDatasetModelAndParam = async (req, res) => {
    const { dataset, model, param } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT DISTINCT ?hyper_param_val
      FROM <http://localhost:8890/test03>
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (
              regex(?evaluationMeasure_label, "${dataset}_${model}_")
              && regex(?evaluationMeasure_label, "_inner_")
          )

          # Extract parameter string (everything between ${dataset}_${model}_ and _inner_)
          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_inner_") AS ?param_string)

          BIND(STRBEFORE(STRAFTER(?param_string, "${param}="), "_") AS ?hyper_param_val)
      }
      `;
  
      const results = await client.query(query).execute();
      
      if (!results || !results.results || !results.results.bindings) {
        console.error("Invalid SPARQL response:", results);
        return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
  
      res.json(results.results.bindings);
    } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
    }
  };



/**
 * @swagger
 * tags:
 *   - name: Experiment Queries
 *     description: Endpoints for retrieving experiment data.(dataset names, model names, hyperparameter names, metric names etc.)
 * /exepriemnts/available_hyperparam_comb/{dataset}/{model}:
 *   get:
 *     summary: Fetches all available hyperparameter combinations for a given dataset and model.
 *     description: Fetches all available hyperparameter combinations for a given dataset and model. Each hyperparamter combinations is depicted as as string that need to be parsed.
 *     tags:
 *       - Experiment Queries
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: Name of the dataset you want to get the hyperparameter combinations for.
 *       - name: model
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "LOGREG"
 *         description: Name of the model you want to get the hyperparameter combinations for.
 *     responses:
 *       200:
 *         description: Successfully retrieved inner performance data for the specified hyperparameter across all metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   param_string:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "_C=0.1_solver=newton-cg_max_iter=100"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected response from Virtuoso"
 */
  const getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations = async (req, res) => {
    const { dataset, model } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
        SELECT DISTINCT ?param_string 
        FROM <http://localhost:8890/test03>
        WHERE {
            ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

            FILTER (
                regex(?evaluationMeasure_label, "${dataset}_${model}_")
                && regex(?evaluationMeasure_label, "_outter_")
            )

            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_outter_") AS ?param_string)
        }
      `;

      const results = await client.query(query).execute();
      
      if (!results || !results.results || !results.results.bindings) {
        console.error("Invalid SPARQL response:", results);
        return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
  
      res.json(results.results.bindings);
    } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
    }
  };


/**
 * @swagger
 * tags:
 *   - name: Experiment Queries
 *     description: Endpoints for retrieving experiment data.(dataset names, model names, hyperparameter names, metric names etc.)
 * /exepriemnts/available_metrics/{dataset}:
 *   get:
 *     summary: Fetches all measured metrics on all experiments done on given dataset.
 *     description: Fetches all measured metrics on all experiments done on given dataset.
 *     tags:
 *       - Experiment Queries
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: Name of the dataset you want to get the measured metrics for.
 *     responses:
 *       200:
 *         description: Successfully retrieved inner performance data for the specified hyperparameter across all metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   metrics:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "recall"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected response from Virtuoso"
 */
  const getAvailableMetricNamesByDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;  
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      const query = `
        SELECT  DISTINCT ?metrics 
        FROM <http://localhost:8890/test03>
        WHERE {
            ?evaluationMeasure rdfs:label ?evaluationMeasure_label .


            FILTER (regex(?evaluationMeasure_label, "${dataset}")
                && !regex(?evaluationMeasure_label, "avg")  
                && regex(?evaluationMeasure_label, "inner_1_")  
                && regex(?evaluationMeasure_label, "_test_evaluation_measure") ) 

            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_1_"), "_test_evaluation_measure") AS ?metrics)
        }
      `;

      const results = await client.query(query).execute();
      
      if (!results || !results.results || !results.results.bindings) {
        console.error("Invalid SPARQL response:", results);
        return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
  
      res.json(results.results.bindings);
    } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
    }
  };


// filter it later by type, img/text and clf/reg
const getAvailableDatasetsNames_Filtered = async (req, res) => {
  const client = req.virtuosoClient;
  try {
      const query = `
          SELECT DISTINCT ?dataset
          FROM <http://localhost:8890/test03>
          WHERE {
              ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

              FILTER (regex(?evaluationMeasure_label, "_10_fold_nested_cross_validation_sampling_process"))
              BIND(STRBEFORE(?evaluationMeasure_label, "_10_fold_nested_cross_validation_sampling_process") AS ?dataset)

          }
      `;
      // console.log(query)
      const results = await client.query(query).execute();
      if (!results || !results.results || !results.results.bindings) {
          console.error("Invalid SPARQL response:", results);
          return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
      res.json(results.results.bindings);
  } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
  }
};



// filter it later by type, img/text and clf/reg
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// THIS QUERY IS HARD CODED FOR THE TEST DATA FIND BETTER WAY
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const getAvailableModelsNames_Filtered = async (req, res) => {
  const client = req.virtuosoClient;
  try {
      const query = `
          SELECT DISTINCT ?model
          FROM <http://localhost:8890/test03>
          WHERE {
              ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

              FILTER ( regex(?evaluationMeasure_label, "_test_predictive_modelling_evaluation_calculation_implementation") )

              BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "_"), "_outter") AS ?model_full)
              BIND(STRBEFORE(STRAFTER(?model_full, "_"), "_") AS ?model)
          }
      `;
      const results = await client.query(query).execute();
      if (!results || !results.results || !results.results.bindings) {
          console.error("Invalid SPARQL response:", results);
          return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
      res.json(results.results.bindings);
  } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
  }
};
  module.exports = { getAvailableModelsNamesForDataset, getOneHyperParamNamesForDatasetAndModel,
     getAvailableHyperParamNamesForDatasetModelAndParam, getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations,
      getAvailableMetricNamesByDataset,getAvailableDatasetsNames_Filtered, getAvailableModelsNames_Filtered};
  