/**
 * @swagger 
 * tags:
 *   - name: Outter Fold Performance
 *     description: Endpoints for retrieving outter fold model porformance data.
 * /outter_performance/by_dataset/{dataset}/{metric}:
 *   get:
 *     summary: Get outer performance of all experiments for a specific metric and dataset
 *     description: Fetches all experiment combinations outer fold performances for a given dataset and metric.
 *     tags:
 *       - Outter Fold Performance 
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: The dataset name.
 *       - name: metric
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "accuracy"
 *         description: The metric name (e.g., accuracy, f1-score).
*     responses:
 *       200:
 *         description: Successfully retrieved performance data.
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
 *                         example: "QDAC"
 *                   fold_num:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "10"
 *                   value:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "0.25"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unexpected response from Virtuoso"
 */
const getOutterPerformanceforMetricAndDataset = async (req, res) => {
    const { dataset, metric } = req.params;
    const client = req.virtuosoClient;  
    try {
      // const query = `
      // SELECT ?model_name ?fold_num ?value 
      // FROM <http://localhost:8890/test03>
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     # Filtering dataset, model, and accuracy metric
      //     FILTER (regex(?evaluationMeasure_label, "${dataset}")
      //         && !regex(?evaluationMeasure_label, "avg")  
      //         && !regex(?evaluationMeasure_label, "inner")  
      //         && !regex(?evaluationMeasure_label, "train")  
      //         && regex(?evaluationMeasure_label, "_${metric}_") ) 

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model_name)

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?fold_num)

      //     # Fetch the value
      //     ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      // }
      // `;
      // const query = `
      //   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      //   PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
      //   PREFIX bfo: <http://purl.obolibrary.org/obo/>
      //   PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      //   SELECT (xsd:int(?outter_fold_str) AS ?outter_fold) ?model (GROUP_CONCAT(?value_inner; separator=" , ") AS ?value)
      //   WHERE {
      //       ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
      //       ?ten_ncv_eval_wf rdfs:label ?ten_ncv_eval_wf_label.
      //       FILTER (STRSTARTS(?ten_ncv_eval_wf_label, "${dataset}_"))
      //       BIND(STRBEFORE(STRAFTER(?ten_ncv_eval_wf_label, "${dataset}_"), "_10_fold_nested_cross_validation_evaluation_workflow_execution") AS ?model)

      //       ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.

      //       ?per_fold bfo:BFO_0000051 ?CV_tr_te_d_asg.
      //       ?per_fold a ontoexp:ontoexp_0006.

      //       ?CV_tr_te_d_asg a ontoexp:ontoexp_0068.
      //       ?CV_tr_te_d_asg rdfs:label ?CV_tr_te_d_asg_label.
      //       BIND(STRBEFORE(STRAFTER(?CV_tr_te_d_asg_label, "${dataset}_"), "_fold_test") AS ?outter_fold_str)
      //       ?CV_tr_te_d_asg <http://www.obofoundry.org/ro/ro.owl#precedes> ?pred_m_tr_te_eval_wf_exec.
      //       # no need for type check because only one type with connection precedes

      //       ?pred_m_tr_te_eval_wf_exec bfo:BFO_0000051 ?pred_m_te_set_eval_calc.
      //       ?pred_m_te_set_eval_calc a ontoexp:ontoexp_0064.
      //       ?pred_m_te_set_eval_calc bfo:BFO_0000051 ?eval_measure_calc.
      //       # dont check type same as above
            
      //       ?eval_measure_calc rdfs:label ?eval_measure_calc_label.
      //       FILTER (regex(?eval_measure_calc_label, "${metric}"))
      //       ?eval_measure_calc bfo:OBI_0000308 ?pred_m_ing_eval_calc_imp.
      //       ?pred_m_ing_eval_calc_imp bfo:OBI_0000294 ?metric.

      //       ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
      //   }
      //   GROUP BY ?outter_fold_str ?model
      // `;
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (xsd:int(?outter_fold_str) AS ?outter_fold) ?model (GROUP_CONCAT(?value_inner; separator=" , ") AS ?value)
        WHERE {
            ?pred_m_te_set_eval_calc a ontoexp:ontoexp_0064.
            ?pred_m_te_set_eval_calc rdfs:label ?pred_m_te_set_eval_calc_label.
            
            FILTER (STRSTARTS(?pred_m_te_set_eval_calc_label, "${dataset}_"))
            BIND(STRBEFORE(STRAFTER(?pred_m_te_set_eval_calc_label, "${dataset}_"), "_{") AS ?model)
            BIND(STRBEFORE(STRAFTER(?pred_m_te_set_eval_calc_label, "outter_"), "_predictive") AS ?outter_fold_str)

            ?pred_m_te_set_eval_calc bfo:BFO_0000051 ?eval_measure_calc.
            # dont check type same as above
            
            ?eval_measure_calc rdfs:label ?eval_measure_calc_label.
            FILTER (regex(?eval_measure_calc_label, "_${metric}_"))
            ?eval_measure_calc bfo:OBI_0000308 ?pred_m_ing_eval_calc_imp.
            ?pred_m_ing_eval_calc_imp bfo:OBI_0000294 ?metric.

            ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
        }
        GROUP BY ?outter_fold_str ?model
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
 *   - name: Outter Fold Performance
 *     description: Endpoints for retrieving outter fold model performance data.
 * /outter_performance/by_model/{model}/{metric}:
 *   get:
 *     summary: Get outer performance for a specific metric and model
 *     description: Fetches the outer fold performance values for a given metric and model across datasets.
 *     tags:
 *       - Outter Fold Performance 
 *     parameters:
 *       - name: metric
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "accuracy"
 *         description: The evaluation metric (e.g., accuracy, f1-score).
 *       - name: model
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "QDAC"
 *         description: The model name (e.g., QDAC, LOGREG).
 *     responses:
 *       200:
 *         description: Successfully retrieved performance data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   dataset_name:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "dataset_5"
 *                   fold_num:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "10"
 *                   value:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "literal"
 *                       value:
 *                         type: string
 *                         example: "0.25"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unexpected response from Virtuoso"
 */
  const getOutterPerformanceforMetricAndModel = async (req, res) => {
    const {  metric, model } = req.params;
    const client = req.virtuosoClient;  
    try {
      // const query = `
      // SELECT ?dataset_name ?fold_num ?value 
      // FROM <http://localhost:8890/test03>
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     # Filtering model, model, and accuracy metric
      //     FILTER (regex(?evaluationMeasure_label, "${model}")
      //         && !regex(?evaluationMeasure_label, "avg")  
      //         && !regex(?evaluationMeasure_label, "inner")  
      //         && !regex(?evaluationMeasure_label, "train")  
      //         && regex(?evaluationMeasure_label, "_${metric}_") ) 

      //     BIND(STRBEFORE(?evaluationMeasure_label, "_${model}") AS ?dataset_name)

      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?fold_num)

      //     # Fetch the value
      //     ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      // }
      // `;
      // const query = `
      //   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      //   PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
      //   PREFIX bfo: <http://purl.obolibrary.org/obo/>
      //   PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      //   SELECT (xsd:int(?outter_fold_str) AS ?outter_fold) ?dataset (GROUP_CONCAT(?value_inner; separator=" , ") AS ?value)
      //   WHERE {
      //       ?ten_ncv_eval_wf a ontoexp:ontoexp_0005.
      //       ?ten_ncv_eval_wf rdfs:label ?ten_ncv_eval_wf_label.
      //       FILTER (regex(?ten_ncv_eval_wf_label, "Automatic_Relevance_Determination_Regression"))
      //       BIND(STRBEFORE(?ten_ncv_eval_wf_label, "_Automatic_Relevance_Determination_Regression") AS ?dataset)

      //       ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold.

      //       ?per_fold bfo:BFO_0000051 ?CV_tr_te_d_asg.
      //       ?per_fold a ontoexp:ontoexp_0006.

      //       ?CV_tr_te_d_asg a ontoexp:ontoexp_0068.
      //       ?CV_tr_te_d_asg rdfs:label ?CV_tr_te_d_asg_label.
      //       BIND(STRBEFORE(STRAFTER(?CV_tr_te_d_asg_label, "Stockport Local Health Characteristics_"), "_fold_test") AS ?outter_fold_str)
      //       ?CV_tr_te_d_asg <http://www.obofoundry.org/ro/ro.owl#precedes> ?pred_m_tr_te_eval_wf_exec.
      //       # no need for type check because only one type with connection precedes

      //       ?pred_m_tr_te_eval_wf_exec bfo:BFO_0000051 ?pred_m_te_set_eval_calc.
      //       ?pred_m_te_set_eval_calc a ontoexp:ontoexp_0064.
      //       ?pred_m_te_set_eval_calc bfo:BFO_0000051 ?eval_measure_calc.
      //       # dont check type same as above
            
      //       ?eval_measure_calc rdfs:label ?eval_measure_calc_label.
      //       FILTER (regex(?eval_measure_calc_label, "R-squared"))
      //       ?eval_measure_calc bfo:OBI_0000308 ?pred_m_ing_eval_calc_imp.
      //       ?pred_m_ing_eval_calc_imp bfo:OBI_0000294 ?metric.

      //       ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
      //   }
      //   GROUP BY ?outter_fold_str ?dataset
      // `;
    
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (xsd:int(?outter_fold_str) AS ?outter_fold) ?dataset (GROUP_CONCAT(?value_inner; separator=" , ") AS ?value)
        WHERE {
            ?pred_m_te_set_eval_calc a ontoexp:ontoexp_0064.
            ?pred_m_te_set_eval_calc rdfs:label ?pred_m_te_set_eval_calc_label.
            FILTER (regex(?pred_m_te_set_eval_calc_label, "${model}"))
            BIND(STRBEFORE(?pred_m_te_set_eval_calc_label, "_${model}") AS ?dataset)
            BIND(STRBEFORE(STRAFTER(?pred_m_te_set_eval_calc_label, "_outter_"), "_predictive_model_") AS ?outter_fold_str)
            ?pred_m_te_set_eval_calc bfo:BFO_0000051 ?eval_measure_calc.
            
            ?eval_measure_calc rdfs:label ?eval_measure_calc_label.
            FILTER (regex(?eval_measure_calc_label, "_${metric}_"))
            ?eval_measure_calc bfo:OBI_0000308 ?pred_m_ing_eval_calc_imp.
            ?pred_m_ing_eval_calc_imp bfo:OBI_0000294 ?metric.

            ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value_inner.
        }
        GROUP BY ?outter_fold_str ?dataset
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
 *   - name: Outter Fold Performance
 *     description: Endpoints for retrieving outter fold model performance data.
 * /outter_performance/by_dataset/all_metrics/{dataset}:
 *   get:
 *     summary: Get outer performance by dataset
 *     description: Fetches the outer fold performance data for a specific dataset, including model, hyperparameter combination, and evaluation metrics.
 *     tags:
 *       - Outter Fold Performance  # Ensure the tag is under the GET operation
 *     parameters:
 *       - name: dataset
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "dataset_5"
 *         description: The name of the dataset (e.g., dataset1, dataset2).
 *     responses:
 *       200:
 *         description: Successfully retrieved outer performance data for the dataset.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   model:
 *                     type: string
 *                     example: "QDAC"
 *                     description: The model used in the evaluation.
 *                   hypercomb:
 *                     type: string
 *                     example: "n_estimators_100"
 *                     description: The hyperparameter combination used in the evaluation.
 *                   outter_fold:
 *                     type: string
 *                     example: "1"
 *                     description: The outer fold number (e.g., 1, 2, 3).
 *                   metrics_values:
 *                     type: string
 *                     example: "accuracy: 0.9 , f1: 0.85"
 *                     description: A string containing the evaluation metrics and their respective values, separated by commas.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unexpected response from Virtuoso"
 */

  const getOutterPerformanceByDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;
    try {
        // const query = `
        //     SELECT DISTINCT ?model ?hypercomb ?outter_fold
        //         (GROUP_CONCAT(?metrics_value; separator=" , ") AS ?metrics_values)
        //     FROM <http://localhost:8890/test03>
        //     WHERE {
        //         ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
        //         FILTER (regex(?evaluationMeasure_label, "${dataset}")
        //             && !regex(?evaluationMeasure_label, "avg")
        //             && !regex(?evaluationMeasure_label, "inner")
        //             && regex(?evaluationMeasure_label, "_test_evaluation_measure"))
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, CONCAT("${dataset}_", ?model, "_")), "_outter") AS ?hypercomb)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_test_evaluation_measure") AS ?metrics_tmp)
        //         BIND(STRAFTER(?metrics_tmp, "_") AS ?metrics)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
        //         ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
        //         BIND(CONCAT(?metrics, ": ", STR(?value)) AS ?metrics_value)
        //     }
        //     GROUP BY ?model ?hypercomb ?outter_fold
        // `;
        const query = `
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
            PREFIX bfo: <http://purl.obolibrary.org/obo/>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            SELECT  ?model ?hypercomb (xsd:int(?outter_fold_str) AS ?outter_fold)  (GROUP_CONCAT(?metric_value; separator=" , ") AS ?metrics)
            WHERE {
                
                ?pred_m_te_set_eval_calc a ontoexp:ontoexp_0064.
                ?pred_m_te_set_eval_calc rdfs:label ?pred_m_te_set_eval_calc_label.
                FILTER (STRSTARTS(?pred_m_te_set_eval_calc_label, "${dataset}_"))
                BIND(STRBEFORE(STRAFTER(?pred_m_te_set_eval_calc_label, "outter_"), "_predictive") AS ?outter_fold_str)
                BIND(STRBEFORE(STRAFTER(?pred_m_te_set_eval_calc_label, "{"), "}") AS ?hypercomb)
                BIND(STRBEFORE(STRAFTER(?pred_m_te_set_eval_calc_label, "${dataset}_"), "_{") AS ?model)

                ?pred_m_te_set_eval_calc bfo:BFO_0000051 ?eval_measure_calc.
                
                ?eval_measure_calc bfo:OBI_0000308 ?pred_m_ing_eval_calc_imp.
                ?pred_m_ing_eval_calc_imp bfo:OBI_0000294 ?metric.
                ?metric a ?metric_class.
                ?metric_class rdfs:label ?metric_class_label.
                ?metric <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value.
                BIND(CONCAT(?metric_class_label, ": ", ?value) AS ?metric_value)

            }
            GROUP BY ?outter_fold_str ?model ?hypercomb 
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

  module.exports = { getOutterPerformanceforMetricAndDataset,getOutterPerformanceforMetricAndModel, getOutterPerformanceByDataset};
  