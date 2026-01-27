const { h } = window.App.VDOM;
const { useState, useEffect } = window.App.Hooks;
import { fetchTodos, createTodo, removeTodo } from "../../shared/api.js";

// src/app/pages/TodoApp.js
export function TodoApp({ data, status }) {
  //const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // 🔥 BẮT BUỘC: sync loader → state
  /*
  useEffect(() => {
    if (Array.isArray(data?.todos)) {
      setTodos(data.todos);
    }
  }, [data]); */
  
  if (status === "loading") {
    return h("p", null, "Loading todos...");
  }

  if (status === "error") {
    return h("p", { style: { color: "red" } }, "Failed to load todos");
  }

  const todos = data?.todos || [];

  async function add() {
    if (!input.trim()) return;
    await createTodo(input);
    setInput("");
    delete window.__CACHE__;   // 🔥 FIX
    await App.Router.reload();
  }
  
  async function del(id) {
    await removeTodo(id);
    delete window.__CACHE__;   // 🔥 FIX
    await App.Router.reload();
  }

  return h("div", { className: "todo-app" },
    h("h1", { className: "todo-title" }, "Todo"),

    h("div", { className: "todo-input-row" },
      h("input", {
        className: "todo-input",
        value: input,
        placeholder: "What needs to be done?",
        oninput: e => setInput(e.target.value)
      }),
      h("button", { className: "todo-add-btn", onclick: add }, "Add")
    ),

    h("ul", { className: "todo-list" },
      todos.map(t =>
        h("li", { className: "todo-item", key: t.id },
          h("span", { className: "todo-text" }, t.text),
          h("button", {
            className: "todo-delete-btn",
            onclick: () => del(t.id)
          }, "×")
        )
      )
    )
  );
}

