const express = require('express');
const client = require('prom-client');

const app = express();
// OpenShift injects the PORT environment variable, defaulting to 8080
const port = process.env.PORT || 8080; 

// Enable the collection of default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Custom metric
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
  });
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from OpenShift!');
});

// The metrics endpoint for OpenShift / Prometheus to scrape
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
