import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from './api';
import TaskItem from './TaskItem';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [servedBy, setServedBy] = useState([]);
  const [error, setError] = useState('');

  // runs an API call, remembers which backend answered and shows errors
  async function callApi(request) {
    try {
      const result = await request;
      setServedBy((list) => [result.servedBy, ...list].slice(0, 6));
      setError('');
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function loadTasks() {
    const result = await callApi(getTasks());
    if (result) {
      setTasks(result.data);
    }
  }

  // load the tasks once when the page opens
  useEffect(() => {
    getTasks()
      .then((result) => {
        setTasks(result.data);
        setServedBy([result.servedBy]);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    const result = await callApi(createTask(title));
    if (result) {
      setTasks((list) => [...list, result.data]);
      setTitle('');
    }
  }

  async function handleUpdate(id, changes) {
    const result = await callApi(updateTask(id, changes));
    if (result) {
      setTasks((list) => list.map((task) => (task.id === id ? result.data : task)));
    }
    return result !== null;
  }

  async function handleDelete(id) {
    const result = await callApi(deleteTask(id));
    if (result) {
      setTasks((list) => list.filter((task) => task.id !== id));
    }
  }

  const doneCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="container">
      <header>
        <h1>Task Manager</h1>
        <p className="served-by">
          Served by: <strong>{servedBy[0] || '-'}</strong>
        </p>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </ul>

      {tasks.length === 0 && <p className="empty">No tasks yet. Add one above.</p>}

      <footer>
        <span>
          {doneCount} of {tasks.length} done
        </span>
        <button className="secondary" onClick={loadTasks}>
          Refresh
        </button>
      </footer>

      <p className="history">Last requests: {servedBy.join(', ') || '-'}</p>
    </main>
  );
}

export default App;