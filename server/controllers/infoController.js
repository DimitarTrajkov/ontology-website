const getAllInfo = async (req, res) => {
  const { dataset } = req.params;
  console.log("blabla");
  const client = req.virtuosoClient;

  // if (!client) {
  //   return res.status(500).json({ error: "Virtuoso client is not initialized." });
  // }

  // console.log("Fetching info for dataset:", dataset);

  try {
    console.log("pomos")

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++      WORKING WITHOUT BINDS        +++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //   const query = `
  //   SELECT ?outer_number ?evaluation_measure ?value
  //   FROM <http://localhost:8890/test03>
  //   WHERE {
  //   ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
    
  //   FILTER (regex(?evaluationMeasure_label, "dataset_5") 
  //        && !regex(?evaluationMeasure_label, "avg")
  //        && regex(?evaluationMeasure_label, "QDAC")  
  //        && !regex(?evaluationMeasure_label, "inner") 
  //        && regex(?evaluationMeasure_label, "train")) .
    
  //   BIND(REPLACE(?evaluationMeasure_label, "^.*outter_(\\d+)_.*$", "$1") AS ?outer_number) .
    
  //   BIND(REPLACE(?evaluationMeasure_label, "^.*_(f1)_.*$", "$1") AS ?evaluation_measure) .
    
  //   ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
  // } LIMIT 10
  // `;
    const query = `
    SELECT ?outer_number ?evaluation_measure ?value
    FROM <http://localhost:8890/test03>
    WHERE {
      ?evaluationMeasure rdfs:label ?evaluationMeasure_label .
      
      FILTER (regex(?evaluationMeasure_label, "${dataset}") 
          && !regex(?evaluationMeasure_label, "avg")
          && regex(?evaluationMeasure_label, "QDAC")  
          && !regex(?evaluationMeasure_label, "inner") 
          && regex(?evaluationMeasure_label, "train")) .
      
      BIND(STRBEFORE(STRAFTER(STR(?evaluationMeasure_label), "outter_"), "_") AS ?outer_number) .
      
      BIND(STRBEFORE(STRAFTER(STR(?evaluationMeasure_label), "_"), "_") AS ?evaluation_measure) .
      
      ?evaluationMeasure <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
    } 
    LIMIT 10
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

module.exports = { getAllInfo };
