const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

jest.mock('../src/db', () => ({ query: jest.fn() }));

const task = { id: 1, title: 'Learn Docker', completed: false };

beforeEach(() => {
  jest.resetAllMocks();
});

describe('GET /api/tasks', () => {
  test('returns all tasks', async () => {
    db.query.mockResolvedValue({ rows: [task] });

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([task]);
  });

  test('returns 500 when the database fails', async () => {
    db.query.mockRejectedValue(new Error('db down'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal server error');
  });
});

describe('POST /api/tasks', () => {
  test('creates a task', async () => {
    db.query.mockResolvedValue({ rows: [task] });

    const res = await request(app).post('/api/tasks').send({ title: '  Learn Docker  ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(task);
    expect(db.query.mock.calls[0][1]).toEqual(['Learn Docker']);
  });

  test('rejects an empty title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('rejects a title longer than 200 characters', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'a'.repeat(201) });

    expect(res.status).toBe(400);
  });

  test('rejects invalid JSON', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{bad json');

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/tasks/:id', () => {
  test('marks a task as completed', async () => {
    db.query.mockResolvedValue({ rowCount: 1, rows: [{ ...task, completed: true }] });

    const res = await request(app).put('/api/tasks/1').send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  test('updates the title', async () => {
    db.query.mockResolvedValue({ rowCount: 1, rows: [{ ...task, title: 'New title' }] });

    const res = await request(app).put('/api/tasks/1').send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New title');
  });

  test('rejects an invalid id', async () => {
    const res = await request(app).put('/api/tasks/abc').send({ completed: true });

    expect(res.status).toBe(400);
  });

  test('rejects an empty title', async () => {
    const res = await request(app).put('/api/tasks/1').send({ title: '' });

    expect(res.status).toBe(400);
  });

  test('rejects a completed value that is not a boolean', async () => {
    const res = await request(app).put('/api/tasks/1').send({ completed: 'yes' });

    expect(res.status).toBe(400);
  });

  test('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValue({ rowCount: 0, rows: [] });

    const res = await request(app).put('/api/tasks/99').send({ completed: true });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  test('deletes a task', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });

    const res = await request(app).delete('/api/tasks/1');

    expect(res.status).toBe(204);
  });

  test('rejects an invalid id', async () => {
    const res = await request(app).delete('/api/tasks/0');

    expect(res.status).toBe(400);
  });

  test('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValue({ rowCount: 0 });

    const res = await request(app).delete('/api/tasks/99');

    expect(res.status).toBe(404);
  });
});