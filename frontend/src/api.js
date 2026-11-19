async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const servedBy = res.headers.get('X-Served-By') || 'unknown';
  const isJson = res.headers.get('Content-Type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return { data, servedBy };
}

export function getTasks() {
  return request('/tasks');
}

export function createTask(title) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function updateTask(id, changes) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}