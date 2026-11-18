const express = require('express');
const db = require('./db');

const router = express.Router();

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function checkTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    return 'title is required';
  }
  if (title.trim().length > 200) {
    return 'title must be 200 characters or less';
  }
  return null;
}

router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM tasks ORDER BY id');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { title } = req.body || {};
  const error = checkTitle(title);
  if (error) {
    return res.status(400).json({ error });
  }

  const result = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'invalid id' });
  }

  const { title, completed } = req.body || {};
  if (title !== undefined) {
    const error = checkTitle(title);
    if (error) {
      return res.status(400).json({ error });
    }
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be true or false' });
  }

  // COALESCE keeps the old value when a field is not sent
  const result = await db.query(
    `UPDATE tasks
     SET title = COALESCE($1, title), completed = COALESCE($2, completed)
     WHERE id = $3
     RETURNING *`,
    [title ? title.trim() : null, completed ?? null, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'task not found' });
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'invalid id' });
  }

  const result = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'task not found' });
  }
  res.status(204).end();
});

module.exports = router;
