import { useState } from 'react';

function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  async function handleSave(event) {
    event.preventDefault();
    const saved = await onUpdate(task.id, { title });
    if (saved) {
      setEditing(false);
    }
  }

  function handleCancel() {
    setTitle(task.title);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="task">
        <form className="edit-form" onSubmit={handleSave}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            autoFocus
          />
          <button type="submit">Save</button>
          <button type="button" className="secondary" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="task">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onUpdate(task.id, { completed: !task.completed })}
      />
      <span className={task.completed ? 'title done' : 'title'}>{task.title}</span>
      <button className="secondary" onClick={() => setEditing(true)}>
        Edit
      </button>
      <button className="danger" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </li>
  );
}

export default TaskItem;