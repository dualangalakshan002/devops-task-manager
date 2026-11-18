const express = require('express');
const os = require('os');
const db = require('./db');
const tasksRouter = require('./tasks');

const app = express();
app.disable('x-powered-by');
const serverName = process.env.SERVER_NAME || os.hostname();

app.use(express.json());

// lets us see which replica answered, useful for the load balancer later
app.use((req, res, next) => {
  res.set('X-Served-By', serverName);
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', servedBy: serverName });
  } catch {
    res.status(503).json({ status: 'error', servedBy: serverName });
  }
});

app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: status === 500 ? 'internal server error' : err.message });
});

module.exports = app;