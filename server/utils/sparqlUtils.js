// utils/sparqlUtils.js

/**
 * Simplifies a SPARQL result by extracting only the .value from each binding.
 * @param {Array} bindings - The `results.results.bindings` array from SPARQL response.
 * @returns {Array<Object>} - Simplified list of result objects.
 */
function simplifyBindings(bindings) {
  const simplified = bindings.map(binding => {
    const obj = {};
    for (const key in binding) {
      if (binding[key]?.value) {
        obj[key] = binding[key].value;
      }
    }
    return obj;
  });

  // If all bindings have only one key, return list of values instead of key-value objects
  if (simplified.length > 0 && Object.keys(simplified[0]).length === 1) {
    return simplified.map(obj => Object.values(obj)[0]);
  }

  return simplified;
}


module.exports = {simplifyBindings,};
