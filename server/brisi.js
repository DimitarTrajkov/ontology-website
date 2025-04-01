// server.js

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.get('/blabla', async (req, res) => {
  try {
    const query = `
      SELECT ?s ?p ?o 
      FROM <http://localhost:8890/test2>
      WHERE {
        ?s ?p ?o .
      } LIMIT 5
    `;

    const endpoint = 'http://localhost:8890/sparql';
    const params = {
      query,
      format: 'application/sparql-results+json',
      timeout: 0,
      signal_void: 'on'
    };

    const response = await axios.get(endpoint, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});





app.get('/hihi', async (req, res) => {
  try {
    const query = `
      SELECT ?s ?p ?o 
      FROM <http://localhost:8890/test2>
      WHERE {
        ?s ?p ?o .
      } LIMIT 10
    `;

    const endpoint = 'http://localhost:8890/sparql';
    const params = {
      query,
      format: 'application/sparql-results+json',
      timeout: 0,
      signal_void: 'on'
    };

    const response = await axios.get(endpoint, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
