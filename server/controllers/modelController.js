// // controllers/modelController.js
// const getModelData = async (req, res) => {
//     const { dataset, model } = req.params;
//     const client = req.virtuosoClient;

//     try {
//         const query = `SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10`; // Example query
//         const results = await client.query(query).exec();
//         res.json(results.results.bindings);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = { getModelData };


// controllers/modelController.js
const getModelData = async (req, res) => {
    // No need to query the database anymore. Just return the hardcoded data.
    console.log("dobivame call");
    // const hardcodedData = {
    //   accuracy: [0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91],
    //   precision: [-0.12, 0.52, 0.2, -0.13, 0.49, 0.71, 0.13, 0.12, -0.78, -0.86],
    //   recall: [-0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47],
    //   sensitivity: [0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91],
    //   f1: [-0.12, 0.52, 0.2, -0.13, 0.49, 0.71, 0.13, 0.12, -0.78, -0.86],
    //   roc: [-0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47],
    // };
  
    // const hardcodedData = [
    //   [0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91],
    //   [-0.12, 0.52, 0.2, -0.13, 0.49, 0.71, 0.13, 0.12, -0.78, -0.86],
    //   [-0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47],
    //   [0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91],
    //   [-0.12, 0.52, 0.2, -0.13, 0.49, 0.71, 0.13, 0.12, -0.78, -0.86],
    //   [-0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47],
    // ];
    const hardcodedData = [
      [0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91, 0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91,0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91],
      [-0.12, 0.52, 0.2, -0.13, 0.49, 0.71, 0.13, 0.12, -0.78, -0.86, -0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47,-0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47],
      [0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91, 0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91,0.01, -0.6, 0.78, -0.87, 0.87, -0.77, -0.05, 0.84, 0.84, -0.91],
      [-0.12, 0.52, 0.2, -0.13, 0.49, 0.71, 0.13, 0.12, -0.78, -0.86, -0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47,-0.62, -0.85, 0.74, 0.87, -0.93, -0.73, -0.96, -0.27, 0.11, -0.47],
    ];
  
    res.json(hardcodedData); // Return the hardcoded object
  };
  


const getFilteredExperiments = async (req, res) => {
  const metricList = JSON.parse(req.query.metricList);
  // console.log(metricList)
  const client = req.virtuosoClient;


  // regex(?evaluationMeasure_label, "f1") ||
  // regex(?evaluationMeasure_label, "cohen kappa")
  // Generate dynamic filters for each metric
  const metricFiltersName = metricList.map(metric => {
    return `
      regex(?evaluationMeasure_label, "${metric.metricName}") 
    `;
  }).join(" || "); 



  // (?metric = "f1" && AVG(xsd:double(?value)) >= 0.18 && AVG(xsd:double(?value)) <= 0.59)
  // || 
  // (?metric = "cohen kappa" && AVG(xsd:double(?value)) >= -0.91 && AVG(xsd:double(?value)) <= 1)
  const metricFiltersHaving = metricList.map(metric => {
    return `
      (?metric = "${metric.metricName}" && AVG(xsd:double(?value)) >= ${metric.from} && AVG(xsd:double(?value)) <= ${metric.to})
    `;
  }).join(" || "); 

  const query = `
    SELECT ?param_string
    WHERE {
        {
            SELECT ?param_string (COUNT(?metric) AS ?count)
            WHERE {
                {

                    SELECT ?param_string (AVG(xsd:double(?value)) AS ?avg_value) ?metric
                    WHERE {
                        ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

                        FILTER (
                            regex(?evaluationMeasure_label, "test_evaluation_measure")
                            && regex(?evaluationMeasure_label, "avg") &&
                            (${metricFiltersName})
                        )

                        BIND(STRBEFORE(?evaluationMeasure_label, "_outer_") AS ?param_string)
                        BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "fold_avg_"), "_test_evaluation_measure") AS ?metric)

                        ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
                    }
                    GROUP BY ?param_string ?metric
                    HAVING (${metricFiltersHaving})

                }
            }
            GROUP BY ?param_string
        }
        FILTER(?count = ${metricList.length}) 
    }
  `;
  console.log(query)
  try {
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

  
  module.exports = { getModelData, getFilteredExperiments };