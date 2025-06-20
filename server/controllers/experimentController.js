const { simplifyBindings } = require('../utils/sparqlUtils');
const dictionary = {
    "binary classification": {
      uri : "OntoDM_208659",
      sufix : "binary_classification"
    },
    "multi class classification": {
      uri : "OntoDM_913132",
      sufix : "multi_class_classification"
    },
    "regression": {
      uri : "OntoDM_837886",
      sufix : "regression"
    }
  }

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
      // 2.2s
      // const query = `
      // SELECT DISTINCT ?model_name
      // FROM <http://localhost:8890/test03>
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     FILTER (
      //         regex(?evaluationMeasure_label, "${dataset}")
      //         && regex(?evaluationMeasure_label, "outter")
      //     )

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model_name)
      // }
      // 0.45s
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?model_name
        FROM <http://localhost:8890/D2>
        WHERE {
          ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
          ?ten_ncv_eval_wf rdfs:label ?ten_ncv_eval_wf_label.
          FILTER ( regex(?ten_ncv_eval_wf_label, "10_fold_nested_cross_validation_evaluation_workflow_execution"))
          
          BIND(STRBEFORE(STRAFTER(?ten_ncv_eval_wf_label, "${dataset}"), "_10_fold_nested_cross_validation_evaluation_workflow_execution") AS ?model_name)
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
      // 1.2s
      // const query = `
      //   SELECT DISTINCT ?param_string 
      //   FROM <http://localhost:8890/test03>
      //   WHERE {
      //       ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //       FILTER (
      //           regex(?evaluationMeasure_label, "${dataset}_${model}_")
      //           && regex(?evaluationMeasure_label, "_outter_")
      //       )

      //       BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_outter_") AS ?param_string)
      //   }
      // `;
      // 0.4s  // can be improved by using limit of per_fold to 1 instead of choosing the 4th fold
      // const query = `
      // PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      // PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
      // PREFIX bfo: <http://purl.obolibrary.org/obo/>
      // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      // SELECT ?text
      // WHERE {
      //   ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
      //   ?ten_ncv_eval_wf rdfs:label "${dataset}_${model}_10_fold_nested_cross_validation_evaluation_workflow_execution".
      //   ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.

      //   ?per_fold rdfs:label ?"${dataset}_${model}_4_fold_evaluation_workflow_execution".
      //   ?per_fold bfo:BFO_0000051 ?three_cv_eval_wf.
      //   ?three_cv_eval_wf a ontoexp:ontoexp_0005.
      //   ?three_cv_eval_wf bfo:BFO_0000051 ?val_calc.
      //   ?val_calc ontoexp:ontoexp_0217 ?text.
      //   }
      // `;
      // Stockport Local Health Characteristics_AdaBoost_Regression_10_fold_nested_cross_validation_evaluation_workflow_execution
      const query = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
      PREFIX bfo: <http://purl.obolibrary.org/obo/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?text
      WHERE {
        {
          SELECT ?per_fold
          WHERE {
            ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
            ?ten_ncv_eval_wf rdfs:label "${dataset}_${model}_10_fold_nested_cross_validation_evaluation_workflow_execution".
            ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.
            ?per_fold a ontoexp:ontoexp_0006.
          }
          LIMIT 1
        }

        ?per_fold bfo:BFO_0000051 ?three_cv_eval_wf.
        ?three_cv_eval_wf a ontoexp:ontoexp_0005.
        ?three_cv_eval_wf bfo:BFO_0000051 ?val_calc.
        ?val_calc ontoexp:ontoexp_0217 ?text.
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


 const getMetricByTaskType = async (req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const {  type } = req.params; 
    const client = req.virtuosoClient;  
    try {
      const query = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
      PREFIX bfo: <http://purl.obolibrary.org/obo/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX schema: <https://schema.org/>

      SELECT DISTINCT (STR(?metric) AS ?metric)
      FROM <http://localhost:8890/dimitar_test01>
      WHERE {
        {
          # get a one dataset for that specific type
          SELECT ?dataset_name
          WHERE {
            ?binary_task a ontoexp:${dictionary[type].uri};
                        rdfs:label ?task_label.
            BIND(STRBEFORE(STR(?task_label), "_${dictionary[type].sufix}_task") AS ?dataset_name)
          }
          LIMIT 1
        }

        ?pred_modelling_eval_calc_imp a ontoexp:ontoexp_0017;
                                      rdfs:label ?pred_modelling_eval_calc_imp_label;
                                      <http://purl.obolibrary.org/obo/OBI_0000294> ?metric_instance.

        FILTER(REGEX(STR(?pred_modelling_eval_calc_imp_label), ?dataset_name))

        ?metric_instance a ?metric_class.
        ?metric_class rdfs:label ?metric.
      }
      `;
      // console.log(query)
   const results = await client.query(query).execute();
    // sleep for 2s just for testinng
    if (!results?.results?.bindings) {
      return res.status(500).json({ error: "Unexpected response from Virtuoso" });
    }

    const simplified = simplifyBindings(results.results.bindings);
    res.json(simplified);
  } catch (error) {
    console.error("Virtuoso error:", error);
    res.status(500).json({ error: error.message });
  }
};




 const getAvailableModelsNames_Filtered = async (req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const {  type } = req.params; 
  
    const client = req.virtuosoClient;  
    try {
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX schema: <https://schema.org/>

        SELECT DISTINCT ?models
        FROM <http://localhost:8890/dimitar_test01>
        WHERE {
          {
            # Get one dataset for that specific type
            SELECT ?dataset_name
            WHERE {
              ?binary_task a ontoexp:${dictionary[type].uri};
                          rdfs:label ?task_label.
              BIND(STRBEFORE(STR(?task_label), "_${dictionary[type].sufix}_task") AS ?dataset_name)
            }
            LIMIT 1
          }

          ?pred_modelling_eval_calc_imp a ontoexp:ontoexp_0066;
                                        rdfs:label ?pred_modelling_eval_calc_imp_label.
          FILTER(REGEX(STR(?pred_modelling_eval_calc_imp_label), ?dataset_name))
          
          BIND(STRBEFORE(STRAFTER(?pred_modelling_eval_calc_imp_label, "_"), "_{") AS ?model)
          BIND(REPLACE(?model, "_", " ") AS ?models)
        }
      `;
      // console.log(query)
   const results = await client.query(query).execute();
    // sleep for 2s just for testinng
    if (!results?.results?.bindings) {
      return res.status(500).json({ error: "Unexpected response from Virtuoso" });
    }

    const simplified = simplifyBindings(results.results.bindings);
    res.json(simplified);
  } catch (error) {
    console.error("Virtuoso error:", error);
    res.status(500).json({ error: error.message });
  }
};



 const getAvailableExperimentForDataset = async(req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const { dataset } = req.params; 
    const metricList = JSON.parse(req.query.metricList);

    const client = req.virtuosoClient;
    const metricFields = metricList.map(metric => {
      metric_without_space = metric.metricName.replace(" ","_")
      return `(MAX(IF(?eval_measure_name = "${metric.metricName}"@en, xsd:double(?value), xsd:double("-1"))) AS ?${metric_without_space})`;}).join("\n"); 

    const metricFiltersHaving = metricList.map(metric => {
      return `
              MAX(IF(?eval_measure_name = "${metric.metricName}"@en, xsd:double(?value), 1)) >= ${metric.from} &&
              MAX(IF(?eval_measure_name = "${metric.metricName}"@en, xsd:double(?value), -1)) <=  ${metric.to}
      `;}).join(" && "); 

    try {
      const query = `
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
          PREFIX bfo: <http://purl.obolibrary.org/obo/>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          PREFIX schema: <https://schema.org/>

          SELECT 
              ?model ?hyperparams
              ${metricFields}
              #(GROUP_CONCAT(DISTINCT ?measure; separator=", ") AS ?measures)
          FROM <http://localhost:8890/dimitar_test01>
          WHERE {
              # This subquery for pagination remains the same. It efficiently selects a page of experiments.
              {
                  SELECT DISTINCT ?per_fold {
                      ?per_fold a ontoexp:ontoexp_0006;
                                rdfs:label ?per_fold_labela.
                      
                      FILTER(STRSTARTS(STR(?per_fold_labela), "${dataset}"))

                      BIND(STRBEFORE(STRAFTER(STR(?per_fold_labela), "${dataset}_"), "_10_fold_evaluation_workflow_execution") AS ?model)
                  }
                  ORDER BY ASC(?per_fold)
                  LIMIT 5 
                  OFFSET 0
              }

              ?per_fold bfo:BFO_0000051 ?inner_cv .
              ?inner_cv bfo:BFO_0000051 ?n_fold_cv_eval_calc .
              ?n_fold_cv_eval_calc <http://purl.obolibrary.org/obo/OBI_0000299> ?eval_measure;
                                  rdfs:label ?labela .

              ?eval_measure a ?eval_measure_class;
                            <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
              ?eval_measure_class rdfs:label ?eval_measure_name .

              BIND(STRBEFORE(STRAFTER(STR(?labela), "${dataset}_"), "_3_fold_avg_test_evaluation_measure_calculation") AS ?experiment)
              BIND(STRBEFORE(?experiment, "_{") AS ?model)
              BIND(CONCAT("{", STRBEFORE(STRAFTER(?experiment, "_{"), "}_"), "}") AS ?hyperparams)
          }
          GROUP BY ?model ?hyperparams
          HAVING (${metricFiltersHaving})
      `;
      // console.log(query)
   const results = await client.query(query).execute();
    // sleep for 2s just for testinng
    if (!results?.results?.bindings) {
      return res.status(500).json({ error: "Unexpected response from Virtuoso" });
    }

    const simplified = simplifyBindings(results.results.bindings);
    res.json(simplified);
  } catch (error) {
    console.error("Virtuoso error:", error);
    res.status(500).json({ error: error.message });
  }
};



  module.exports = { getAvailableModelsNamesForDataset, getOneHyperParamNamesForDatasetAndModel,
     getAvailableHyperParamNamesForDatasetModelAndParam, getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations,
      getAvailableMetricNamesByDataset,getAvailableDatasetsNames_Filtered, getAvailableModelsNames_Filtered, getMetricByTaskType, getAvailableExperimentForDataset}
  