// controllers/datasetController.js
const { simplifyBindings } = require('../utils/sparqlUtils');

 const getRawMetafeaturesForDataset = async (req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const {  dataset } = req.params; 
    const client = req.virtuosoClient;  
    try {
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>

        SELECT (STR(?metafeature) AS ?metafeature) ?value
        FROM <http://localhost:8890/dimitar_test01>
        WHERE {

          ?dataset_class a ontoexp:OntoDM_000144;
                        rdfs:label ?dataset;
                        <http://purl.obolibrary.org/obo/OBI_0000298> ?metafeature_instance.

          FILTER(?dataset = "${dataset}.csv")

          ?metafeature_instance a ?metafeature_class;
                        <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value.

          ?metafeature_class rdfs:label ?metafeature.
          
        }
      `;
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


 const getPreProcessedmetafeaturesForDataset = async (req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const {  dataset } = req.params; 
    const client = req.virtuosoClient;  
    try {
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>

        SELECT (STR(?metafeature) AS ?metafeature) ?value
        FROM <http://localhost:8890/dimitar_test01>
        WHERE {

          ?dataset_class a ontoexp:OntoDM_000144;
                        rdfs:label ?dataset;
                        <http://purl.obolibrary.org/obo/OBI_0000298> ?metafeature_instance.

          FILTER(?dataset = "${dataset}_preprocessed.csv")

          ?metafeature_instance a ?metafeature_class;
                        <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value.

          ?metafeature_class rdfs:label ?metafeature.
          
        }
      `;
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

  module.exports = { getRawMetafeaturesForDataset,getPreProcessedmetafeaturesForDataset };