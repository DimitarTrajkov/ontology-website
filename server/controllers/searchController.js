// controllers/datasetController.js
const { simplifyBindings } = require('../utils/sparqlUtils');

// const getDatasets = async (req, res) => {
//     const { filterText, sortField, sortOrder, selectedTypes, page = 1, limit = 10 } = req.query;
//     const selectedTypesArray = selectedTypes ? selectedTypes.split(',') : [];
//     console.log("filterText", filterText);
//     console.log("sortField", sortField);
//     console.log("sortOrder", sortOrder);
//     console.log("selectedTypes", selectedTypesArray);
//     console.log("page", page);
//     console.log("limit", limit);
//     const client = req.virtuosoClient; 

//     // if (!client) {
//     //   return res.status(500).json({ error: "Virtuoso client is not initialized." });
//     // }
  
//     // console.log("Fetching info for dataset:", dataset);
  
//     try {
//       const query = `
//       SELECT ?s AS ?model ?p AS ?accuracy
//       FROM <http://localhost:8890/test2>
//       WHERE {
//         ?s ?p ?o .
//       } 
//       LIMIT 10 
//     `;
    
  
//       const results = await client.query(query).execute();
      
//       if (!results || !results.results || !results.results.bindings) {
//         console.error("Invalid SPARQL response:", results);
//         return res.status(500).json({ error: "Unexpected response from Virtuoso" });
//       }
//       const fake_data = { datasets:[
//         { title: "dataset_5", publisher: "Scribner", date: "1925", type: "Regression" },
//         { title: "Introduction to React", publisher: "Facebook", date: "2023", type: "Classification" },
//         { title: "Another Book", publisher: "Some Publisher", date: "2020", type: "Regression" },
//         { title: "Image Example", publisher: null, date: null, type: "Images" },
//         { title: "Regression Analysis", publisher: "StatSoft", date: "2018", type: "Regression" },
//         { title: "Classification Algorithms", publisher: "DataScience Inc.", date: "2021", type: "Classification" },
//       ],
//       totalPages: 10
//     };
//       res.json(fake_data);
//       // res.json(results.results.bindings);
//     } catch (error) {
//       console.error("Error querying Virtuoso:", error);
//       res.status(500).json({ error: error.message });
//     }
//   };



 const getAllDatasets = async (req, res) => {
    const client = req.virtuosoClient;  
    try {
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX schema: <https://schema.org/>

        SELECT (SUBSTR(?dataset, 1, STRLEN(?dataset) - 4) AS ?dataset) ?type ?date
              (GROUP_CONCAT(DISTINCT COALESCE(?publisher, ""); separator=", ") AS ?publishers)
              (GROUP_CONCAT(DISTINCT ?creator; separator=", ") AS ?creators)
        FROM <http://localhost:8890/dimitar_test01>
        WHERE {
          {
            ?regression_task a ontoexp:OntoDM_837886;
                            <http://semanticscience.org/resource/SIO_000059> ?spec.
            ?spec <http://purl.obolibrary.org/obo/IAO_0000136> ?dataset_class.
            BIND("regression" AS ?type)
          }
          UNION
          {
            ?binary_task a ontoexp:OntoDM_208659;
                        <http://semanticscience.org/resource/SIO_000059> ?spec.
            ?spec <http://purl.obolibrary.org/obo/IAO_0000136> ?dataset_class.
            BIND("binary classification" AS ?type)
          }
          UNION
          {
            ?multi_task a ontoexp:OntoDM_913132;
                        <http://semanticscience.org/resource/SIO_000059> ?spec.
            ?spec <http://purl.obolibrary.org/obo/IAO_0000136> ?dataset_class.
            BIND("multiclass classification" AS ?type)
          }

          # Required metadata
          ?dataset_class a ontoexp:OntoDM_000144;
                        rdfs:label ?dataset;
                        schema:dateCreated ?date.

          # Optional publisher
          OPTIONAL {
            ?dataset_class schema:publisher ?publisher_class.
            ?publisher_class rdfs:label ?publisher.
            ?dataset_class schema:creator ?creator_class.
            ?creator_class rdfs:label ?creator.
          }
        }
        GROUP BY ?dataset ?date ?type
      `;
   const results = await client.query(query).execute();

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



 const getFullInfoForDataset = async (req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const {  dataset } = req.params; 
    const client = req.virtuosoClient;  
    try {
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
        PREFIX bfo: <http://purl.obolibrary.org/obo/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX schema: <https://schema.org/>

        SELECT 
          (SUBSTR(?dataset, 1, STRLEN(?dataset) - 4) AS ?dataset) 
          ?type 
          ?date  
          ?description 
          ?encodingFormat 
          ?license 
          ?analysis
          (GROUP_CONCAT(DISTINCT COALESCE(?publisher, ""); separator=", ") AS ?publishers)
          (GROUP_CONCAT(DISTINCT COALESCE(?publisher_url, ""); separator=", ") AS ?publisher_urls)
          (GROUP_CONCAT(DISTINCT COALESCE(?creator, ""); separator=", ") AS ?creators)
          (GROUP_CONCAT(DISTINCT COALESCE(?creator_url, ""); separator=", ") AS ?creator_urls)
          (GROUP_CONCAT(DISTINCT ?identifier; separator=", ") AS ?identifiers)

        FROM <http://localhost:8890/dimitar_test01>
        WHERE {
          {
            ?regression_task a ontoexp:OntoDM_837886;
                            <http://semanticscience.org/resource/SIO_000059> ?spec.
            ?spec <http://purl.obolibrary.org/obo/IAO_0000136> ?dataset_class.
            BIND("regression" AS ?type)
          }
          UNION
          {
            ?binary_task a ontoexp:OntoDM_208659;
                        <http://semanticscience.org/resource/SIO_000059> ?spec.
            ?spec <http://purl.obolibrary.org/obo/IAO_0000136> ?dataset_class.
            BIND("binary classification" AS ?type)
          }
          UNION
          {
            ?multi_task a ontoexp:OntoDM_913132;
                        <http://semanticscience.org/resource/SIO_000059> ?spec.
            ?spec <http://purl.obolibrary.org/obo/IAO_0000136> ?dataset_class.
            BIND("multiclass classification" AS ?type)
          }

          # Required metadata
          ?dataset_class a ontoexp:OntoDM_000144;
                        rdfs:label ?dataset;
                        rdfs:comment ?analysis;
                        schema:dateCreated ?date;
                        schema:description ?description;
                        schema:encodingFormat ?encodingFormat;
                        schema:license ?license;
                        schema:identifier ?identifier.

        FILTER(?dataset = "${dataset}.csv")

          # Optional publisher and creator with identifiers
          OPTIONAL {
            ?dataset_class schema:publisher ?publisher_class.
            OPTIONAL { ?publisher_class rdfs:label ?publisher. }
            OPTIONAL { ?publisher_class schema:identifier ?publisher_url. }
          }

          OPTIONAL {
            ?dataset_class schema:creator ?creator_class.
            OPTIONAL { ?creator_class rdfs:label ?creator. }
            OPTIONAL { ?creator_class schema:identifier ?creator_url. }
          }
        }
        GROUP BY ?dataset ?date ?type ?description ?encodingFormat ?license ?analysis
      `;
   const results = await client.query(query).execute();

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

 const getTrainedModelsForDataset = async (req, res) => {
    // dataset == Cerebral Stroke Prediction-Imbalanced Dataset
    const {  dataset } = req.params; 
    const client = req.virtuosoClient;  
    try {
      const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>

        SELECT ?models

        FROM <http://localhost:8890/dimitar_test01>
        WHERE {
          ?N_f_cv_eval_wf_exec a ontoexp:ontoexp_0005;
                              rdfs:label ?N_f_cv_eval_wf_exec_label.
          FILTER (
            regex(?N_f_cv_eval_wf_exec_label, "${dataset}")
            && regex(?N_f_cv_eval_wf_exec_label, "_10_fold_nested_cross_validation_evaluation_workflow_execution")
          )
          
          BIND(STRBEFORE(
                  STRAFTER(?N_f_cv_eval_wf_exec_label, "${dataset}"),
                  "_10_fold_nested_cross_validation_evaluation_workflow_execution"
              ) AS ?model_raw)
          
          BIND(REPLACE(?model_raw, "_", " ") AS ?models)
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

  module.exports = { getAllDatasets, getFullInfoForDataset, getTrainedModelsForDataset };