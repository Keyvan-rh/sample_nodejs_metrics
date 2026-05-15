const express = require('express');
const promClient = require('prom-client');
const app = express();

// Collect default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics();

// Expose metrics at /metrics
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});

app.listen(8080, () => {
  console.log('Metrics endpoint available at http://localhost:8080/metrics');
});   
