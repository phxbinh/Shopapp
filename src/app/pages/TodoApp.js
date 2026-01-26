// src/pages/TodoApp.js
const { h } = window.App.VDOM;
const { useState, useEffect } = window.App.Hooks;
import { queryDb, addTodoDb, deleteTodoDb } from '../api/db.js';

export function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTodos() {
      try {
        setLoading(true);
        const data = await queryDb('SELECT * FROM todos ORDER BY id DESC');
        setTodos(data || []);
      } catch (err) {
        setError('Không thể tải danh sách công việc. Kiểm tra kết nối Neon.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTodos();
  }, []);

  async function handleAddTodo() {
    if (!input.trim()) return;
    try {
      await addTodoDb(input.trim());
      setInput('');
      const updated = await queryDb('SELECT * FROM todos ORDER BY id DESC');
      setTodos(updated || []);
    } catch (err) {
      setError('Không thể thêm công việc.');
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodoDb(id);
      const updated = await queryDb('SELECT * FROM todos ORDER BY id DESC');
      setTodos(updated || []);
    } catch (err) {
      setError('Không thể xóa công việc.');
      console.error(err);
    }
  }

  return h('div', { style: { maxWidth: '500px', margin: '2rem auto', padding: '1rem', fontFamily: 'system-ui' } },
    h('h1', { style: { textAlign: 'center' } }, 'Todo App - Neon + VDOM Hooks'),
    
    error && h('div', { style: { color: 'red', marginBottom: '1rem' } }, error),
    
    h('div', { style: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' } },
      h('input', {
        value: input,
        oninput: e => setInput(e.target.value),
        placeholder: 'Nhập công việc mới...',
        style: { flex: 1, padding: '0.75rem', fontSize: '1rem' }
      }),
      h('button', {
        onclick: handleAddTodo,
        disabled: loading || !input.trim(),
        style: { padding: '0.75rem 1.5rem', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer' }
      }, 'Thêm')
    ),

    loading && h('p', { style: { textAlign: 'center' } }, 'Đang tải...'),

    h('ul', { style: { listStyle: 'none', padding: 0 } },
      todos.length === 0 && !loading && h('p', { style: { textAlign: 'center', color: '#666' } }, 'Chưa có công việc nào'),
      todos.map(todo =>
        h('li', {
          key: todo.id,
          style: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0.75rem',
            borderBottom: '1px solid #eee',
            background: '#f9f9f9',
            marginBottom: '0.5rem',
            borderRadius: '6px'
          }
        },
          h('span', {}, todo.text),
          h('button', {
            onclick: () => handleDelete(todo.id),
            style: { background: '#ff4d4d', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }
          }, 'Xóa')
        )
      )
    )
  );
}