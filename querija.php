    SELECT DISTINCT ?param_name
    FROM <http://localhost:8890/test03>
    WHERE {
        ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

        FILTER (
            regex(?evaluationMeasure_label, "${dataset}_${model}_")
            && regex(?evaluationMeasure_label, "_outter_")
        )

        BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}_"), "_outter_") AS ?param_name)
    }





SELECT DISTINCT ?param_name
FROM <http://localhost:8890/test03>
WHERE {
    ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

    FILTER (
        regex(?evaluationMeasure_label, "${dataset}_${model}_")
        && regex(?evaluationMeasure_label, "_outter_")
    )

    # Extract parameter string (everything between ${dataset}_${model}_ and _outter_)
    BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}_"), "_outter_") AS ?param_string)

    # Remove parameter values (keep only param names)
    BIND(REPLACE(?param_string, "=([^_]+)", "", "i") AS ?param_name)
}



SELECT DISTINCT ?param_name ?param_string
FROM <http://localhost:8890/test03>
WHERE {
    ?evaluationMeasure rdfs:label ?evaluationMeasure_label .

    FILTER (
        regex(?evaluationMeasure_label, "${dataset}_${model}_")
        && regex(?evaluationMeasure_label, "_outter_")
    )

    # Extract parameter string (everything between ${dataset}_${model}_ and _outter_)
    BIND(STRBEFORE(STRAFTER(?evaluationMeasure_label, "${dataset}_${model}"), "_outter_") AS ?param_string)

    BIND(STRBEFORE(STRAFTER(?param_string, "_"), "=") AS ?param_name)
}












