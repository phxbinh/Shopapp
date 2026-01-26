export async function fetchTodos() {
  const res = await fetch('/api/todos');
  return res.json();
}

export async function addTodo(text) {
  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

export async function deleteTodo(id) {
  await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
}