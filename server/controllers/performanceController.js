const GRAPH_NAME = "<http://localhost:8890/big_test>";  // Global variable


const getOutterPerformanceforMetricAndDataset = async (req, res) => {
    const { dataset, metric } = req.params;
    const client = req.virtuosoClient;  
    try {
      // const query = `
      // SELECT ?model_name ?value 
      // FROM ${GRAPH_NAME}
      // WHERE {
      //     ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

      //     # Filtering dataset, model, and accuracy metric
      //     FILTER (regex(?evaluationMeasure_label, "${dataset}")
      //         && !regex(?evaluationMeasure_label, "avg")  
      //         && !regex(?evaluationMeasure_label, "inner")  
      //         && !regex(?evaluationMeasure_label, "train")  
      //         && regex(?evaluationMeasure_label, "_${metric}_") ) 

      //     # Extract model name (between dataset_5_ and _outter_)
      //     BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model_name)

      //     # Fetch the value
      //     ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      // }
      // `;
      const query = `
      SELECT ?model_name ?fold_num ?value 
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          # Filtering dataset, model, and accuracy metric
          FILTER (regex(?evaluationMeasure_label, "${dataset}")
              && !regex(?evaluationMeasure_label, "avg")  
              && !regex(?evaluationMeasure_label, "inner")  
              && !regex(?evaluationMeasure_label, "train")  
              && regex(?evaluationMeasure_label, "_${metric}_") ) 

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model_name)

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?fold_num)

          # Fetch the value
          ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      } LIMIT 10000
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
  
  
  const getOutterPerformanceforMetricAndModel = async (req, res) => {
    const {  metric, model } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT ?dataset_name ?fold_num ?value 
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          # Filtering model, model, and accuracy metric
          FILTER (regex(?evaluationMeasure_label, "${model}")
              && !regex(?evaluationMeasure_label, "avg")  
              && !regex(?evaluationMeasure_label, "inner")  
              && !regex(?evaluationMeasure_label, "train")  
              && regex(?evaluationMeasure_label, "_${metric}_") ) 

          BIND(STRBEFORE(?evaluationMeasure_label, "_${model}") AS ?dataset_name)

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?fold_num)

          # Fetch the value
          ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      } LIMIT 10000
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
  






const getAvailableModelsNamesForDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT DISTINCT ?model_name
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (
              regex(?evaluationMeasure_label, "${dataset}")
              && regex(?evaluationMeasure_label, "outter")
          )

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model_name)
      } LIMIT 10000
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





const getAvailableParamsNamesForDatasetAndModel = async (req, res) => {
    const { dataset, model } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT DISTINCT ?param_string
      FROM ${GRAPH_NAME}
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



  const getAvailableHyperParamNamesForDatasetModelAndParam = async (req, res) => {
    const { dataset, model, param } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
      SELECT DISTINCT ?hyper_param_name
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (
              regex(?evaluationMeasure_label, "${dataset}_${model}_")
              && regex(?evaluationMeasure_label, "_inner_")
          )

          # Extract parameter string (everything between ${dataset}_${model}_ and _inner_)
          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_inner_") AS ?param_string)

          BIND(STRBEFORE(STRAFTER(?param_string, "${param}="), "_") AS ?hyper_param_name)
      } LIMIT 10000
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
  const getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations = async (req, res) => {
    const { dataset, model } = req.params;
    const client = req.virtuosoClient;  
    try {
      const query = `
        SELECT DISTINCT ?param_string 
        FROM ${GRAPH_NAME}
        WHERE {
            ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

            FILTER (
                regex(?evaluationMeasure_label, "${dataset}_${model}_")
                && regex(?evaluationMeasure_label, "_outter_")
            )

            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_outter_") AS ?param_string)
        } LIMIT 10000
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



  const getInnerPerformanceForHyperparamSetAndMetric = async (req, res) => {
    const { mertric, hyperparam } = req.params;
    const client = req.virtuosoClient;  
    // console.log(mertric)
    // console.log(hyperparam)
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      const query = `
      SELECT  ?value ?outter_fold ?inner_fold
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (regex(?evaluationMeasure_label, "${hyperparam}")
              && !regex(?evaluationMeasure_label, "avg")  
              && regex(?evaluationMeasure_label, "inner")  
              && !regex(?evaluationMeasure_label, "train")  
              && regex(?evaluationMeasure_label, "_${mertric}_") ) 

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_") AS ?inner_fold)


          ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      } LIMIT 10000
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

  const getInnerPerformanceForHyperparamSet_AllMetrics = async (req, res) => {
    const {  hyperparam } = req.params;
    const client = req.virtuosoClient;  
    // console.log(mertric)
    // console.log(hyperparam)
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      const query = `
      SELECT  ?value ?outter_fold ?inner_fold ?metric
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (regex(?evaluationMeasure_label, "${hyperparam}")
              && !regex(?evaluationMeasure_label, "avg")  
              && regex(?evaluationMeasure_label, "inner")  
              && regex(?evaluationMeasure_label, "test")  ) 

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_") AS ?inner_fold)
          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?inner_metric)
          BIND(STRAFTER(?inner_metric, "_") AS ?metric)


          ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      } LIMIT 10000
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



  const getAvailableMetricNamesByDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;  
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      const query = `
        SELECT  DISTINCT ?metrics 
        FROM ${GRAPH_NAME}
        WHERE {
            ?evaluationMeasure rdfs:label ?evaluationMeasure_label .


            FILTER (regex(?evaluationMeasure_label, "${dataset}")
                && !regex(?evaluationMeasure_label, "avg")  
                && regex(?evaluationMeasure_label, "inner_1_")  
                && regex(?evaluationMeasure_label, "_test_evaluation_measure") ) 

            BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_1_"), "_test_evaluation_measure") AS ?metrics)
        } LIMIT 10000
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



  const getInnerPerformanceForHyperparamSet_AllMetrics_AVG = async (req, res) => {
    const {  hyperparam } = req.params; 
    const client = req.virtuosoClient;  
    // console.log(mertric)
    // console.log(hyperparam)
    // dataset_5_LOGREG_C=0.1_solver=newton-cg_max_iter=100
    try {
      const query = `
      SELECT ?metric (AVG(xsd:double(?value)) AS ?average_value)
      FROM ${GRAPH_NAME}
      WHERE {
          ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

          FILTER (regex(?evaluationMeasure_label, "${hyperparam}")
              && !regex(?evaluationMeasure_label, "avg")  
              && regex(?evaluationMeasure_label, "inner")  
              && regex(?evaluationMeasure_label, "test")  ) 

          BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?inner_metric)
          BIND(STRAFTER(?inner_metric, "_") AS ?metric)

          ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
      }
      GROUP BY ?metric
      LIMIT 10000
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
  
  module.exports = { getOutterPerformanceforMetricAndDataset, getAvailableModelsNamesForDataset, getAvailableParamsNamesForDatasetAndModel,
     getAvailableHyperParamNamesForDatasetModelAndParam, getAvailableHyperParamNameValueCombForDatasetAnaModelCombinations, getInnerPerformanceForHyperparamSetAndMetric,
     getInnerPerformanceForHyperparamSet_AllMetrics, getAvailableMetricNamesByDataset, getInnerPerformanceForHyperparamSet_AllMetrics_AVG, getOutterPerformanceforMetricAndModel};
  