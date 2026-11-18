const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

jest.mock('../src/db', () => ({ query: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
});

test('GET /api/health returns ok when the database is up', async () => {
  db.query.mockResolvedValue({ rows: [] });

  const res = await request(app).get('/api/health');

  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('GET /api/health returns 503 when the database is down', async () => {
  db.query.mockRejectedValue(new Error('connection refused'));

  const res = await request(app).get('/api/health');

  expect(res.status).toBe(503);
  expect(res.body.status).toBe('error');
});

test('every response has the X-Served-By header', async () => {
  const res = await request(app).get('/api/unknown');

  expect(res.status).toBe(404);
  expect(res.headers['x-served-by']).toBeDefined();
});