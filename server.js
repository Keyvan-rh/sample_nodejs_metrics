const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// 1. Enable the collection of default metrics (CPU, memory, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// 2. Create a custom metric (e.g., a counter for HTTP requests)
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status']
});

// Middleware to count requests and track their status
app.use((req, res, next) => {
  res.on('finish', () => {
    // Record metric when the request finishes
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
  });
  next();
});

// 3. Sample application routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Here is some data' });
});

// 4. Expose the /metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
});
