import time
import requests
from SPARQLWrapper import SPARQLWrapper, JSON

query1 = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?experiment (GROUP_CONCAT(DISTINCT ?measure; separator=", ") AS ?measures)
FROM <http://localhost:8890/dimitar_test01>
WHERE {
    # Subquery to pre-filter candidates using fast, direct, language-tagged matching.
    {
        SELECT ?n_fold_cv_eval_calc_label ?eval_measure_name ?value
        WHERE {
            ?n_fold_cv_eval_calc a ontoexp:ontoexp_0062;
                rdfs:label ?n_fold_cv_eval_calc_label;
                <http://purl.obolibrary.org/obo/OBI_0000299> ?eval_measure.
            
            ?eval_measure a ?eval_measure_class;
                <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value.
            
            ?eval_measure_class rdfs:label ?eval_measure_name.

            # OPTIMIZATION: Use IN with language-tagged strings. This is extremely fast.
            FILTER(?eval_measure_name IN ("accuracy"@en, "precision"@en, "recall"@en))
        }
    }

    # Now apply the more complex numeric filters on the small, pre-selected result set.
    FILTER (
        (?eval_measure_name = "accuracy"@en && xsd:double(?value) >= -100.0 && xsd:double(?value) <= 1000.0) ||
        (?eval_measure_name = "precision"@en && xsd:double(?value) >= -100.0) ||
        (?eval_measure_name = "recall"@en && xsd:double(?value) >= -100.0 && xsd:double(?value) <= 1000.0)
    )

    # Perform expensive BIND operations at the very end.
    # Note: STR() is still needed here to get the clean string "accuracy" for the output.
    # This is fine because it runs on very few rows after all filtering is complete.
    BIND(STRBEFORE(?n_fold_cv_eval_calc_label, "_3_fold_avg_test_evaluation_measure_calculation") AS ?experiment)
    BIND(CONCAT(STR(?eval_measure_name), ":", STR(?value)) AS ?measure)
}
GROUP BY ?experiment
"""
# the quoery too 0.0527 seconds with only 1 dataset in th database
# the quoery too 0.0615 seconds with only 2 dataset in th database




query2 = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?experiment (GROUP_CONCAT(DISTINCT ?measure; separator=", ") AS ?measures)
FROM <http://localhost:8890/dimitar_test01>
WHERE {
    {
        ?n_fold_cv_eval_calc a ontoexp:ontoexp_0062;
            rdfs:label ?n_fold_cv_eval_calc_label;
            <http://purl.obolibrary.org/obo/OBI_0000299> ?eval_measure.
        
        ?eval_measure a ?eval_measure_class;
            <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value.
        
        ?eval_measure_class rdfs:label ?eval_measure_name.

    FILTER (
          (?eval_measure_name = "accuracy"@en && xsd:double(?value) >= -100.0 && xsd:double(?value) <= 1000.0) ||
          (?eval_measure_name = "precision"@en && xsd:double(?value) >= -100.0) ||
          (?eval_measure_name = "recall"@en && xsd:double(?value) >= -100.0 && xsd:double(?value) <= 1000.0)
      )
    }
    BIND(STRBEFORE(?n_fold_cv_eval_calc_label, "_3_fold_avg_test_evaluation_measure_calculation") AS ?experiment)
    BIND(CONCAT(STR(?eval_measure_name), ":", STR(?value)) AS ?measure)
}
GROUP BY ?experiment
"""

query3= """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
PREFIX bfo: <http://purl.obolibrary.org/obo/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <https://schema.org/>

SELECT 
    (MAX(IF(?eval_measure_name = "accuracy"@en, xsd:double(?value), xsd:double("-1"))) AS ?accuracy)
    (MAX(IF(?eval_measure_name = "average precision"@en, xsd:double(?value), xsd:double("-1"))) AS ?average_precision)
    (MAX(IF(?eval_measure_name = "balanced accuracy"@en, xsd:double(?value), xsd:double("-1"))) AS ?balanced_accuracy)
    ?model ?hyperparams
    # (GROUP_CONCAT(DISTINCT ?measure; separator=", ") AS ?measures)
FROM <http://localhost:8890/dimitar_test01>
WHERE {
    # This subquery for pagination remains the same. It efficiently selects a page of experiments.
    {
        SELECT DISTINCT ?per_fold {
            ?per_fold a ontoexp:ontoexp_0006;
                      rdfs:label ?per_fold_labela.
            
            FILTER(STRSTARTS(STR(?per_fold_labela), "Cerebral Stroke Prediction-Imbalanced Dataset"))
        }
        # The main ORDER BY for pagination should be on a stable, unique value.
        ORDER BY ?per_fold 
        LIMIT 5   # <-- _PAGE_SIZE_
        OFFSET 0  # <-- _OFFSET_
    }

    # --- Get all the data associated with the paged experiments ---
    ?per_fold bfo:BFO_0000051 ?inner_cv .
    ?inner_cv bfo:BFO_0000051 ?n_fold_cv_eval_calc .
    ?n_fold_cv_eval_calc <http://purl.obolibrary.org/obo/OBI_0000299> ?eval_measure;
                         rdfs:label ?labela .

    ?eval_measure a ?eval_measure_class;
                  <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .
    ?eval_measure_class rdfs:label ?eval_measure_name .

    # --- STEP 1: BIND new variables for sorting and display ---
    BIND(STRBEFORE(STRAFTER(STR(?labela), "Cerebral Stroke Prediction-Imbalanced Dataset_"), "_3_fold_avg_test_evaluation_measure_calculation") AS ?experiment)
    BIND(STRBEFORE(?experiment, "_{") AS ?model)
    BIND(CONCAT("{", STRBEFORE(STRAFTER(?experiment, "_{"), "}_"), "}") AS ?hyperparams)
    
    # BIND(CONCAT(STR(?eval_measure_name), ": ", STR(?value)) AS ?measure)
}
GROUP BY ?experiment ?model ?hyperparams

# --- STEP 2: Add HAVING clause for range filtering ---
# This clause checks if the condition is met for any measure WITHIN the group.
# To disable filtering, your application should simply not include the HAVING clause.
HAVING (
    MAX(IF(?eval_measure_name = "accuracy"@en, xsd:double(?value), 1)) > 0.1 &&
    MAX(IF(?eval_measure_name = "accuracy"@en, xsd:double(?value), -1)) < 0.8 &&

    MAX(IF(?eval_measure_name = "average precision"@en, xsd:double(?value), 1)) > 0.1 &&
    MAX(IF(?eval_measure_name = "average precision"@en, xsd:double(?value), -1)) < 0.8 &&

    MAX(IF(?eval_measure_name = "balanced accuracy"@en, xsd:double(?value), 1)) > 0.1 &&
    MAX(IF(?eval_measure_name = "balanced accuracy"@en, xsd:double(?value), -1)) < 0.8
)

# --- STEP 3: Add ORDER BY for dynamic sorting ---
# Your application should construct this line based on user selection.
# Use only ONE of these ORDER BY lines at a time.
ORDER BY DESC(?accuracy) 
# ORDER BY DESC(?accuracy)
# ORDER BY ASC(?model)
# ORDER BY DESC(?model)
# ORDER BY ASC(?hyperparams)
# ORDER BY DESC(?hyperparams)
# ORDER BY ASC(?experiment)
# ORDER BY DESC(?experiment)
"""

def benchmark_query_with_size(query, label):
    endpoint_url = "http://semanticannotations.ijs.si:8890/sparql"

    times = []
    sizes = []

    for i in range(5):
        # Prepare the request manually to capture raw response
        headers = {"Accept": "application/sparql-results+json"}
        params = {"query": query}

        start = time.time()
        response = requests.get(endpoint_url, headers=headers, params=params)
        end = time.time()

        duration = end - start
        size = len(response.content)

        times.append(duration)
        sizes.append(size)

        print(f"{label} - Run {i+1}: {duration:.4f} sec | Size: {size/1024:.2f} KB")

    # Remove best and worst
    times_sorted = sorted(times)
    sizes_sorted = sorted(sizes)

    avg_time = sum(times_sorted[2:-2]) / len(times_sorted[2:-2])
    avg_size = sum(sizes_sorted[2:-2]) / len(sizes_sorted[2:-2])

    print(f"{label} - Avg time: {avg_time:.4f} sec | Avg size: {avg_size/1024:.2f} KB\n")


# benchmark_query_with_size(query1, "Query 1")
benchmark_query_with_size(query3, "Query 3")
