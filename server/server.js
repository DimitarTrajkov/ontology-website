const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const SparqlClient = require('sparql-client-2');

const searchRoutes = require('./routes/search');
const infoRoutes = require('./routes/info');
const innerRoutes = require('./routes/innerData');
const outterRoutes = require('./routes/outterData');
const experimentRoutes = require('./routes/ExperimentNames');
const modelRoutes = require('./routes/models');
const radarRoutes = require('./routes/radar');
const performanceRoutes = require('./routes/performance');
const tableRoutes = require('./routes/tables');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Virtuoso Configuration
const virtuosoEndpoint = 'http://localhost:8890/sparql';
const virtuosoUsername = 'dba';
const virtuosoPassword = 'dba';

// Middleware to attach Virtuoso client
app.use((req, res, next) => {
  req.virtuosoClient = new SparqlClient(virtuosoEndpoint, {
    user: virtuosoUsername,
    password: virtuosoPassword
  }).register({
    default: virtuosoEndpoint
  });

  next();
});

// Mount the routers
app.use('/search', searchRoutes);
app.use('/info', infoRoutes);
app.use('/inner_performance', innerRoutes);
app.use('/outter_performance', outterRoutes);
app.use('/exepriemnts', experimentRoutes);
app.use('/radar', radarRoutes);
app.use('/performance', performanceRoutes);
app.use('/table', tableRoutes);
app.use('/', modelRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
