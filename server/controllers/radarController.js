// controllers/radarController.js
const getRadarData = async (req, res) => {
    const { model } = req.params;
    const client = req.virtuosoClient;

    try {
        const query = `SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10`; // Example query
        const results = await client.query(query).exec();
        res.json(results.results.bindings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getRadarData };