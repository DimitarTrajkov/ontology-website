
/**
 * @swagger
 * tags:
 *   - name: Inner Performance
 *     description: Endpoints for retrieving inner performance data based on hyperparameters and metrics
 * /inner_performance/hyperparam/{metric}/{experiemnt}:
 *   get:
 *     summary: Get inner fold performance for given experiment and coresponding metric
 *     description: Fetches the inner fold test performance data for a specific experiment ( dataset, model and hyperparameter combination ) and metric combination.
 *     tags:
 *       - Inner Performance
 *     parameters:
 *       - name: metric
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "accuracy"
 *         description: The name of the metric (e.g., "accuracy", "f1").
 *       - name: experiemnt
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100"
 *         description: "The experiment (e.g., 'dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100') has the following format: (dataset_name)_(model_name)_(hyperparam1_name)=(hyperparam1_value)...(hyperparam_n_name)=(hyperparam_n_value)"
 *     responses:
 *       200:
 *         description: Successfully retrieved inner performance data for the specified hyperparameter and metric.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "0.3333333333333333"
 *                   outter_fold:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "3"
 *                       value:
 *                         type: string
 *                         example: "10"
 *                   inner_fold:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "7"
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
const getInnerPerformanceForExperimentAndMetric = async (req, res) => {
    const { mertric, experiment } = req.params;
    const client = req.virtuosoClient;  
    // console.log(mertric)
    // console.log(experiment)
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      // const query = `
      // SELECT  ?value ?outter_fold ?inner_fold
      // FROM <http://localhost:8890/test03>
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     FILTER (regex(?evaluationMeasure_label, "${experiment}")
      //         && !regex(?evaluationMeasure_label, "avg")  
      //         && regex(?evaluationMeasure_label, "inner")  
      //         && !regex(?evaluationMeasure_label, "train")  
      //         && regex(?evaluationMeasure_label, "_${mertric}_") ) 

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_") AS ?inner_fold)


      //     ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      // }
      // `;

      // {n_iter: 600; alpha_1: 1e-07; alpha_2: 1e-07; lambda_1: 1e-06; lambda_2: 1e-06}
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (xsd:double(?value_inner) AS ?value)  (xsd:int(?outter_fold_str) AS ?outter_fold) ?hyper_params
        WHERE {
            ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
            ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.
            ?per_fold a ontoexp:ontoexp_0006.


            ?per_fold bfo:BFO_0000051 ?three_cv_eval_wf.
            ?three_cv_eval_wf a ontoexp:ontoexp_0005.


            ?three_cv_eval_wf bfo:BFO_0000051 ?eval_calc.
            ?eval_calc a ontoexp:ontoexp_0062.
            ?eval_calc rdfs:label ?eval_calc_label.
            BIND(STRBEFORE(STRAFTER(?eval_calc_label, "_outer_"), "_3_fold_avg_test_evaluation_measure_calculation") AS ?outter_fold_str)
            
            ?eval_calc ontoexp:ontoexp_0217 "${experiment}".


            ?eval_calc bfo:OBI_0000299 ?metric.
            ?metric a ?metric_class.
            ?metric_class rdfs:label ?metric_class_label.
            FILTER (STR(?metric_class_label) = "${mertric}")


            ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
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
 *   - name: Inner Performance
 *     description: Endpoints for retrieving inner performance data based on hyperparameters for all metrics
 * /inner_performance/hyperparam/all_metrics/{experiemnt}:
 *   get:
 *     summary: Get inner fold performance for all metrics for a given experiment.
 *     description: Fetches the inner fold test performance data for all available metrics and specific experiment ( dataset, model and hyperparameter combination ).
 *     tags:
 *       - Inner Performance
 *     parameters:
 *       - name: experiemnt
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100"
 *         description: "The experiment (e.g., 'dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100') has the following format: (dataset_name)_(model_name)_(hyperparam1_name)=(hyperparam1_value)...(hyperparam_n_name)=(hyperparam_n_value)"
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
 *                   value:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "0.3333333333333333"
 *                   outter_fold:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "10"
 *                   inner_fold:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "3"
 *                   metric:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "f1"
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
  const getInnerPerformanceForHyperparamSet_AllMetrics = async (req, res) => {
    const {  experiment } = req.params;
    const client = req.virtuosoClient;  
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      // const query = `
      // SELECT  ?value ?outter_fold ?inner_fold ?metric
      // FROM <http://localhost:8890/test03>
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     FILTER (regex(?evaluationMeasure_label, "${experiment}")
      //         && !regex(?evaluationMeasure_label, "avg")  
      //         && regex(?evaluationMeasure_label, "inner")  
      //         && regex(?evaluationMeasure_label, "test")  ) 

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_") AS ?inner_fold)
      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?inner_metric)
      //     BIND(STRAFTER(?inner_metric, "_") AS ?metric)


      //     ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      // }
      // `;
      // {n_iter: 600; alpha_1: 1e-07; alpha_2: 1e-07; lambda_1: 1e-06; lambda_2: 1e-06}
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (xsd:double(?value_inner) AS ?value)  (xsd:int(?outter_fold_str) AS ?outter_fold) (STR(?metric_class_label) as ?metric)
        WHERE {
            ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
            ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.
            ?per_fold a ontoexp:ontoexp_0006.


            ?per_fold bfo:BFO_0000051 ?three_cv_eval_wf.
            ?three_cv_eval_wf a ontoexp:ontoexp_0005.


            ?three_cv_eval_wf bfo:BFO_0000051 ?eval_calc.
            ?eval_calc a ontoexp:ontoexp_0062.
            ?eval_calc rdfs:label ?eval_calc_label.
            BIND(STRBEFORE(STRAFTER(?eval_calc_label, "_outer_"), "_3_fold_avg_test_evaluation_measure_calculation") AS ?outter_fold_str)
            
            ?eval_calc ontoexp:ontoexp_0217 "${experiment}".


            ?eval_calc bfo:OBI_0000299 ?metric.
            ?metric a ?metric_class.
            ?metric_class rdfs:label ?metric_class_label.

            ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
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
 *   - name: Inner Performance
 *     description: Endpoints for retrieving inner performance data
 * /inner_performance/hyperparam/avg_all_metrics/{experiment}:
 *   get:
 *     summary: Get average inner fold performance of a experiment for each available metrics.
 *     description: Get average inner fold performance of a experiment for each available metrics. Experiment includes specific dataset, model and hyperparameter combination.
 *     tags:
 *       - Inner Performance
 *     parameters:
 *       - name: experiemnt
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100"
 *         description: "The experiment (e.g., 'dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100') has the following format: (dataset_name)_(model_name)_(hyperparam1_name)=(hyperparam1_value)...(hyperparam_n_name)=(hyperparam_n_value)"
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
 *                   metric:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "f1"
 *                   average_value:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "0.3333333333333333"
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
 
  const getInnerPerformanceForHyperparamSet_AllMetrics_AVG = async (req, res) => {
    const {  experiment } = req.params; 
    const client = req.virtuosoClient;  
    // console.log(mertric)
    // console.log(experiment)
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      // const query = `
      // SELECT ?metric (AVG(xsd:double(?value)) AS ?average_value)
      // FROM <http://localhost:8890/test03>
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     FILTER (regex(?evaluationMeasure_label, "${experiment}")
      //         && !regex(?evaluationMeasure_label, "avg")  
      //         && regex(?evaluationMeasure_label, "inner")  
      //         && regex(?evaluationMeasure_label, "test")  ) 

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?inner_metric)
      //     BIND(STRAFTER(?inner_metric, "_") AS ?metric)

      //     ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      // }
      // GROUP BY ?metric
      // `;
      // {n_iter: 600; alpha_1: 1e-07; alpha_2: 1e-07; lambda_1: 1e-06; lambda_2: 1e-06}
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (AVG(xsd:double(?value_inner)) AS ?value) (STR(?metric_class_label) as ?metric)
        WHERE {
            ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
            ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.
            ?per_fold a ontoexp:ontoexp_0006.


            ?per_fold bfo:BFO_0000051 ?three_cv_eval_wf.
            ?three_cv_eval_wf a ontoexp:ontoexp_0005.


            ?three_cv_eval_wf bfo:BFO_0000051 ?eval_calc.
            ?eval_calc a ontoexp:ontoexp_0062.
            
            ?eval_calc ontoexp:ontoexp_0217 "${experiment}".


            ?eval_calc bfo:OBI_0000299 ?metric.
            ?metric a ?metric_class.
            ?metric_class rdfs:label ?metric_class_label.

            ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
        }
        GROUP BY ?metric_class_label
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
 *   - name: Inner Performance
 *     description: Endpoints for retrieving average inner performance data for all experiments
 * /inner_performance/all_hyperparam/all_metrics/{dataset}:
 *   get:
 *     summary: Get all experiments for a given dataset and return inner fold test performance averaged by all metrics. 
 *     description: Fetches all experiments for a given dataset and returns inner fold test performance averaged by all metrics. Each experiment from the dataset coresponds for given inner fold corespods with one value with is average from all measured metrics.
 *     tags:
 *       - Inner Performance
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: "The dataset name (e.g., 'dataset_5') is the name of the dataset for which the inner performance data is to be retrieved."
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
 *                   metric:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "f1"
 *                   average_value:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "0.3333333333333333"
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

  const getInnerPerformanceByDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;
    try {
        const query = `
        SELECT DISTINCT ?model ?hypercomb ?inner_fold ?outter_fold
            (GROUP_CONCAT(?metrics_value; separator=" , ") AS ?metrics_values)
            FROM <http://localhost:8890/test03>
            WHERE {
            ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
            FILTER (regex(?evaluationMeasure_label, "${dataset}")
                && !regex(?evaluationMeasure_label, "avg")
                && regex(?evaluationMeasure_label, "inner")
                && regex(?evaluationMeasure_label, "_test_evaluation_measure"))
            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model)
            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, CONCAT("${dataset}_", ?model, "_")), "_outter") AS ?hypercomb)
            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?metrics_tmp)
            BIND(STRAFTER(?metrics_tmp, "_") AS ?metrics)
            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_") AS ?inner_fold)
            ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
            BIND(CONCAT(?metrics, ": ", STR(?value)) AS ?metrics_value)
            }
            GROUP BY ?model ?hypercomb ?inner_fold ?outter_fold
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
 *   - name: Inner Performance
 *     description: Endpoints for retrieving inner test average performance data
 * /inner_performance/all_experiments:
 *   get:
 *     summary: Get inner test average performance for all experiments on all metrics
 *     description: Fetches all experiments and their average value among all inner test perofrmances for each metric.
 *     tags:
 *       - Inner Performance
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
 *                   experiment:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "dataset_5_LOGREG_C=1_solver=newton-cg_max_iter=100"
 *                   metrics_values:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "recall: 0.368729903206816, f1: 0.350609031171358, average precision: 0.345477258388193 cohen kappa: 0.051548619438574"
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

  const getInnerTestAveragePerformanceForAllExperiments = async (req, res) => {
    const client = req.virtuosoClient;
    try {
        const query = `
            SELECT ?experiment
                (GROUP_CONCAT(CONCAT(?metric, ": ", STR(?average_value)); separator=", ") AS ?metrics_values)
            FROM <http://localhost:8890/test03>
            WHERE {
                {
                    SELECT ?experiment ?metric (AVG(xsd:double(?value)) AS ?average_value)
                    WHERE {
                        ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
                        
                        FILTER (!regex(?evaluationMeasure_label, "avg")  
                            && regex(?evaluationMeasure_label, "inner")  
                            && regex(?evaluationMeasure_label, "test")) 

                        BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?inner_metric)
                        BIND(STRAFTER(?inner_metric, "_") AS ?metric)
                        BIND(STRBEFORE(?evaluationMeasure_label, "_outter_") AS ?experiment)

                        ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
                    }
                    GROUP BY ?experiment ?metric
                }
            }
            GROUP BY ?experiment
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
 *   - name: Inner Performance
 *     description: Endpoints for retrieving inner test average performance data
 * /inner_performance/all_experiments/filtered:
 *   get:
 *     summary: Get inner test average performance for all experiments on all metrics that satisfy the filter.
 *     description: Fetches all experiments and their average value among all inner test perofrmances for each metric. Return only those experiments that satisfy the filter having specific metrics in a specific range.
 *     tags:
 *       - Inner Performance
 *     parameters:
 *       - name: metricList
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: '[{ "metricName": "recall", "from": 0, "to": 1 }, { "metricName": "average precision", "from": 0, "to": 1 }, { "metricName": "f1", "from": 0, "to": 1 }, { "metricName": "accuracy", "from": 0, "to": 1 }, { "metricName": "matthews corrcoef", "from": 0, "to": 0.81 }, { "metricName": "fowlkes mallows", "from": 0, "to": 1 }, { "metricName": "jaccard", "from": 0, "to": 1 }, { "metricName": "balanced accuracy", "from": 0, "to": 1 }, { "metricName": "precision", "from": 0, "to": 1 }, { "metricName": "cohen kappa", "from": 0, "to": 1 }]'
 *         description: 'A JSON string containing the list of metrics with their range (from and to values), e.g., `{ "metricName": "recall", "from": 0, "to": 1 }`'
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
 *                   experiment:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "dataset_5_LOGREG_C=1_solver=newton-cg_max_iter=100"
 *                   metrics_values:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "recall: 0.368729903206816, f1: 0.350609031171358, average precision: 0.345477258388193 cohen kappa: 0.051548619438574"
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
  const getInnerTestAveragePerformanceForAllExperiments_FilteredByMetricRange = async (req, res) => {
    const metricList = JSON.parse(req.query.metricList);
    console.log(metricList)
    const client = req.virtuosoClient;
    const metricFiltersHaving = metricList.map(metric => {
        return `(?metric = "${metric.metricName}" && AVG(xsd:double(?value)) >= ${metric.from} && AVG(xsd:double(?value)) <= ${metric.to})`;
        }).join(" || "); 

    try {
        const query = `
            SELECT ?experiment
                (GROUP_CONCAT(CONCAT(?metric, ": ", STR(?average_value)); separator=", ") AS ?metrics_values)
            FROM <http://localhost:8890/test03>
            WHERE {
                {
                    SELECT ?experiment ?metric (AVG(xsd:double(?value)) AS ?average_value)
                    WHERE {
                        ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
                        
                        FILTER (!regex(?evaluationMeasure_label, "avg")  
                            && regex(?evaluationMeasure_label, "inner")  
                            && regex(?evaluationMeasure_label, "test")) 

                        BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?inner_metric)
                        BIND(STRAFTER(?inner_metric, "_") AS ?metric)
                        BIND(STRBEFORE(?evaluationMeasure_label, "_outter_") AS ?experiment)

                        ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
                    }
                    GROUP BY ?experiment ?metric
                    HAVING (${metricFiltersHaving})
                }
            }
            GROUP BY ?experiment
            HAVING (COUNT(?metric) = ${metricList.length})
        `;
        console.log(query)
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
  module.exports = { getInnerPerformanceForExperimentAndMetric, getInnerPerformanceForHyperparamSet_AllMetrics,
    getInnerPerformanceForHyperparamSet_AllMetrics_AVG, getInnerPerformanceByDataset,
    getInnerTestAveragePerformanceForAllExperiments, getInnerTestAveragePerformanceForAllExperiments_FilteredByMetricRange};
