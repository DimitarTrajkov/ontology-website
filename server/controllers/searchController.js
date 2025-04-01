// controllers/datasetController.js

const getDatasets = async (req, res) => {
    const { filterText, sortField, sortOrder, selectedTypes, page = 1, limit = 10 } = req.query;
    const selectedTypesArray = selectedTypes ? selectedTypes.split(',') : [];
    console.log("filterText", filterText);
    console.log("sortField", sortField);
    console.log("sortOrder", sortOrder);
    console.log("selectedTypes", selectedTypesArray);
    console.log("page", page);
    console.log("limit", limit);
    const client = req.virtuosoClient; 

    // if (!client) {
    //   return res.status(500).json({ error: "Virtuoso client is not initialized." });
    // }
  
    // console.log("Fetching info for dataset:", dataset);
  
    try {
      const query = `
      SELECT ?s AS ?model ?p AS ?accuracy
      FROM <http://localhost:8890/test2>
      WHERE {
        ?s ?p ?o .
      } 
      LIMIT 10 
    `;
    
  
      const results = await client.query(query).execute();
      
      if (!results || !results.results || !results.results.bindings) {
        console.error("Invalid SPARQL response:", results);
        return res.status(500).json({ error: "Unexpected response from Virtuoso" });
      }
      const fake_data = { datasets:[
        { title: "dataset_5", publisher: "Scribner", date: "1925", type: "Regression" },
        { title: "Introduction to React", publisher: "Facebook", date: "2023", type: "Classification" },
        { title: "Another Book", publisher: "Some Publisher", date: "2020", type: "Regression" },
        { title: "Image Example", publisher: null, date: null, type: "Images" },
        { title: "Regression Analysis", publisher: "StatSoft", date: "2018", type: "Regression" },
        { title: "Classification Algorithms", publisher: "DataScience Inc.", date: "2021", type: "Classification" },
      ],
      totalPages: 10
    };
      res.json(fake_data);
      // res.json(results.results.bindings);
    } catch (error) {
      console.error("Error querying Virtuoso:", error);
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = { getDatasets };