// src/app/pages/TodoApp.js
const { h } = window.App.VDOM;
const { useState, useEffect } = window.App.Hooks;

import {
  fetchTodos,
  addTodo,
  deleteTodo
} from '../../shared/api.js';

export function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data || []);
    } catch (err) {
      setError('Không thể tải danh sách công việc.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo() {
    if (!input.trim()) return;
    try {
      await addTodo(input.trim());
      setInput('');
      await loadTodos();
    } catch (err) {
      setError('Không thể thêm công việc.');
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodo(id);
      await loadTodos();
    } catch (err) {
      setError('Không thể xóa công việc.');
      console.error(err);
    }
  }

  return h(
    'div',
    { style: { maxWidth: '500px', margin: '2rem auto', padding: '1rem' } },

    h('h1', { style: { textAlign: 'center' } }, 'Todo App'),

    error && h('div', { style: { color: 'red', marginBottom: '1rem' } }, error),

    h('div', { style: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' } },
      h('input', {
        value: input,
        oninput: e => setInput(e.target.value),
        placeholder: 'Nhập công việc mới...',
        style: { flex: 1, padding: '0.75rem' }
      }),
      h('button', {
        onclick: handleAddTodo,
        disabled: loading || !input.trim()
      }, 'Thêm')
    ),

    loading && h('p', {}, 'Đang tải...'),

    h('ul', { style: { listStyle: 'none', padding: 0 } },
      todos.length === 0 && !loading &&
        h('p', { style: { color: '#666' } }, 'Chưa có công việc nào'),

      todos.map(todo =>
        h('li',
          {
            key: todo.id,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: '#f9f9f9',
              marginBottom: '0.5rem'
            }
          },
          h('span', {}, todo.text),
          h('button', {
            onclick: () => handleDelete(todo.id)
          }, 'Xóa')
        )
      )
    )
  );
}