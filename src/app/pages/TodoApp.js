const { h } = window.App.VDOM;
const { useState, useEffect } = window.App.Hooks;
import { fetchTodos, createTodo, removeTodo } from "../../shared/api.js";

export function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  async function add() {
    if (!input.trim()) return;
    await createTodo(input);
    setInput("");
    setTodos(await fetchTodos());
  }

  async function del(id) {
    await removeTodo(id);
    setTodos(await fetchTodos());
  }

  return h("div", null,
    h("h1", null, "Todo"),
    h("input", {
      value: input,
      oninput: e => setInput(e.target.value)
    }),
    h("button", { onclick: add }, "Add"),
    loading
      ? h("p", null, "Loading…")
      : h("ul", null,
          todos.map(t =>
            h("li", { key: t.id },
              t.text,
              h("button", { onclick: () => del(t.id) }, "X")
            )
          )
        )
  );
}