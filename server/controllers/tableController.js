const GRAPH_NAME = "<http://localhost:8890/dimitar_test01>";  // Global variable
 
const getOutterPerformanceByDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;
    try {
        // const query = `
        //     SELECT DISTINCT ?model ?hypercomb ?metrics ?outter_fold ?value
        //     FROM ${GRAPH_NAME}
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
        //     }
        // `;
        const query = `
            SELECT DISTINCT ?model ?hypercomb ?outter_fold
                (GROUP_CONCAT(?metrics_value; separator=" , ") AS ?metrics_values)
            FROM ${GRAPH_NAME}
            WHERE {
                ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
                FILTER (regex(?evaluationMeasure_label, "${dataset}")
                    && !regex(?evaluationMeasure_label, "avg")
                    && !regex(?evaluationMeasure_label, "inner")
                    && regex(?evaluationMeasure_label, "_test_evaluation_measure"))
                BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model)
                BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, CONCAT("${dataset}_", ?model, "_")), "_outter") AS ?hypercomb)
                BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_test_evaluation_measure") AS ?metrics_tmp)
                BIND(STRAFTER(?metrics_tmp, "_") AS ?metrics)
                BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
                ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
                BIND(CONCAT(?metrics, ": ", STR(?value)) AS ?metrics_value)
            }
            GROUP BY ?model ?hypercomb ?outter_fold
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

const getInnerPerformanceByDataset = async (req, res) => {
    const { dataset } = req.params;
    const client = req.virtuosoClient;
    try {
        // RETURNs SAME AS BELLOW BUT EACH METRIC IS A SEPARATE ROW
        // const query = `
        //     SELECT DISTINCT ?model ?hypercomb ?metrics ?outter_fold ?inner_fold ?value
        //     FROM ${GRAPH_NAME}
        //     WHERE {
        //         ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
        //         FILTER (regex(?evaluationMeasure_label, "${dataset}")
        //             && !regex(?evaluationMeasure_label, "avg")
        //             && regex(?evaluationMeasure_label, "inner")
        //             && regex(?evaluationMeasure_label, "_test_evaluation_measure"))
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_"), "_") AS ?model)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, CONCAT("${dataset}_", ?model, "_")), "_outter") AS ?hypercomb)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_test_evaluation_measure") AS ?metrics_tmp)
        //         BIND(STRAFTER(?metrics_tmp, "_") AS ?metrics)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "outter_"), "_") AS ?outter_fold)
        //         BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "inner_"), "_") AS ?inner_fold)
        //         ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
        //     }
        // `;
        const query = `
        SELECT DISTINCT ?model ?hypercomb ?inner_fold ?outter_fold
            (GROUP_CONCAT(?metrics_value; separator=" , ") AS ?metrics_values)
            FROM ${GRAPH_NAME}
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
const getInnerTestAveragePerformanceForAllExperiments = async (req, res) => {
    const client = req.virtuosoClient;
    try {
        const query = `
            SELECT ?experiment
                (GROUP_CONCAT(CONCAT(?metric, ": ", STR(?average_value)); separator=", ") AS ?metrics_values)
            FROM ${GRAPH_NAME}
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
const getInnerTestAveragePerformanceForAllExperiments_FilteredByMetricRange = async (req, res) => {
    const metricList = JSON.parse(req.query.metricList);
    const client = req.virtuosoClient;
    const metricFiltersHaving = metricList.map(metric => {
        return `(?metric = "${metric.metricName}" && AVG(xsd:double(?value)) >= ${metric.from} && AVG(xsd:double(?value)) <= ${metric.to})`;
        }).join(" || "); 

    try {
        const query = `
            SELECT ?experiment
                (GROUP_CONCAT(CONCAT(?metric, ": ", STR(?average_value)); separator=", ") AS ?metrics_values)
            FROM ${GRAPH_NAME}
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
            LIMIT 10000
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

// filter it later by type, img/text and clf/reg
const getAvailableDatasetsNames_Filtered = async (req, res) => {
    const client = req.virtuosoClient;
    try {
        const query = `
            SELECT DISTINCT ?dataset
            FROM ${GRAPH_NAME}
            WHERE {
                ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

                FILTER (regex(?evaluationMeasure_label, "_10_fold_nested_cross_validation_sampling_process"))
                BIND(STRBEFORE(?evaluationMeasure_label, "_10_fold_nested_cross_validation_sampling_process") AS ?dataset)

            } LIMIT 10000
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
            FROM ${GRAPH_NAME}
            WHERE {
                ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

                FILTER ( regex(?evaluationMeasure_label, "_test_predictive_modelling_evaluation_calculation_implementation") )

                BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "_"), "_outter") AS ?model_full)
                BIND(STRBEFORE(STRAFTER(?model_full, "_"), "_") AS ?model)
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

module.exports = { getOutterPerformanceByDataset, getInnerPerformanceByDataset,
    getInnerTestAveragePerformanceForAllExperiments,getInnerTestAveragePerformanceForAllExperiments_FilteredByMetricRange,
     getAvailableDatasetsNames_Filtered, getAvailableModelsNames_Filtered};
