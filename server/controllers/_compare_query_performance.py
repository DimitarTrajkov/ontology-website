import time
from SPARQLWrapper import SPARQLWrapper, JSON

query1 = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
PREFIX bfo: <http://purl.obolibrary.org/obo/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?model (GROUP_CONCAT(?metrics_value_per_fold; separator=" , ") AS ?metrics) ?hypercomb
WHERE {
  {
    SELECT ?model ?hypercomb (CONCAT(?outer_fold_str, "= ", GROUP_CONCAT(?metric_value; separator=" , ")) AS ?metrics_value_per_fold)
    WHERE {
      ?ten_ncv_eval_wf a ontoexp:ontoexp_0005 ;
                       rdfs:label ?ten_ncv_eval_wf_label .
      FILTER(STRSTARTS(?ten_ncv_eval_wf_label, "Stockport Local Health Characteristics_"))
      
      BIND(STRBEFORE(STRAFTER(?ten_ncv_eval_wf_label, "Stockport Local Health Characteristics_"), "_10_fold_nested_cross_validation_evaluation_workflow_execution") AS ?model)

      ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold .
      ?per_fold a ontoexp:ontoexp_0006 ;
                bfo:BFO_0000051 ?three_cv_eval_wf .

      ?three_cv_eval_wf bfo:BFO_0000051 ?eval_calc .

      ?eval_calc rdfs:label ?eval_calc_label ;
                 ontoexp:ontoexp_0217 ?hypercomb ;
                 bfo:OBI_0000299 ?metric .

    BIND(STRBEFORE(STRAFTER(?eval_calc_label, "_outer_"), "_3_fold_avg_test_evaluation_measure_calculation") AS ?outer_fold_str)


      ?metric a ?metric_class ;
              <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .

      ?metric_class rdfs:label ?metric_class_label .
      BIND(CONCAT(?metric_class_label, ": ", ?value) AS ?metric_value)
    }
    GROUP BY ?model ?hypercomb ?outer_fold_str
  }
}
GROUP BY ?model ?hypercomb
"""

query2 = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontoexp: <http://www.ontodm.com/OntoDM-core/>
PREFIX bfo: <http://purl.obolibrary.org/obo/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?model (GROUP_CONCAT(?metrics_value_per_fold; separator=" , ") AS ?metrics) ?hypercomb
WHERE {
  {
    SELECT ?model ?hypercomb (CONCAT(?outer_fold_str, "= ", GROUP_CONCAT(?metric_value; separator=" , ")) AS ?metrics_value_per_fold)
    WHERE {
      ?ten_ncv_eval_wf a ontoexp:ontoexp_0005 ;
                       rdfs:label ?ten_ncv_eval_wf_label .
      FILTER(STRSTARTS(?ten_ncv_eval_wf_label, "Stockport Local Health Characteristics_"))
      
      BIND(STRBEFORE(STRAFTER(?ten_ncv_eval_wf_label, "Stockport Local Health Characteristics_"), "_10_fold_nested_cross_validation_evaluation_workflow_execution") AS ?model)

      ?ten_ncv_eval_wf bfo:BFO_0000051 ?per_fold .
      ?per_fold a ontoexp:ontoexp_0006 ;
                bfo:BFO_0000051 ?three_cv_eval_wf .

      ?three_cv_eval_wf bfo:BFO_0000051 ?eval_calc .

      ?eval_calc rdfs:label ?eval_calc_label ;
                 ontoexp:ontoexp_0217 ?hypercomb ;
                 bfo:OBI_0000299 ?metric .

    BIND(STRBEFORE(STRAFTER(?eval_calc_label, "_outer_"), "_3_fold_avg_test_evaluation_measure_calculation") AS ?outer_fold_str)


      ?metric a ?metric_class ;
              <http://www.ontodm.com/OntoDT#OntoDT_0000240> ?value .

      ?metric_class rdfs:label ?metric_class_label .
      BIND(CONCAT(?metric_class_label, ": ", ?value) AS ?metric_value)
    }
    GROUP BY ?model ?hypercomb ?outer_fold_str
    LIMIT 5
  }
}
GROUP BY ?model ?hypercomb
"""

def benchmark_query(query, label):
    times = []
    for i in range(5):
        sparql = SPARQLWrapper("http://localhost:8890/sparql")
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        start = time.time()
        sparql.query().convert()
        end = time.time()
        duration = end - start
        times.append(duration)
        print(f"{label} - Run {i+1}: {duration:.4f} seconds")

    # Remove best and worst
    times_sorted = sorted(times)
    trimmed_times = times_sorted[1:-1]
    avg_time = sum(trimmed_times) / len(trimmed_times)
    print(f"{label} - Average time (without best and worst): {avg_time:.4f} seconds\n")

benchmark_query(query1, "Query 1")
benchmark_query(query2, "Query 2")
