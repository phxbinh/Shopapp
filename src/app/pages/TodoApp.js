const { h } = window.App.VDOM;
const { useState, useEffect } = window.App.Hooks;
import { fetchTodos, createTodo, removeTodo } from "../../shared/api.js";

/*
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

return h("div", { className: "todo-app" },
  h("h1", { className: "todo-title" }, "Todo"),

  h("div", { className: "todo-input-row" },
    h("input", {
      className: "todo-input",
      value: input,
      placeholder: "What needs to be done?",
      oninput: e => setInput(e.target.value)
    }),
    h("button", {
      className: "todo-add-btn",
      onclick: add
    }, "Add")
  ),

  loading
    ? h("p", { className: "todo-loading" }, "Loading…")
    : h("ul", { className: "todo-list" },
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
*/


export function TodoApp_({data}) {
  const todos = data?.todos || {}
  //alert(
  return h("div", null, "🔥 TODO APP ALIVE");
}



// src/app/pages/TodoApp.js
export function TodoApp({ data }) {
  const todos = data || [];
  alert(JSON.stringify(data))
 // const [todos] = useState(data.todos || []);
  //const [todos, setTodos] = useState(data?.todos || []);
  const [input, setInput] = useState("");

  async function add() {
    if (!input.trim()) return;
    await createTodo(input);
    setInput("");
    App.Router.rerender(); // 🔥 re-run loader
  }

  async function del(id) {
    await removeTodo(id);
    App.Router.rerender(); // 🔥 re-run loader
  }

/*
  return h("div", null,
    h("h1", null, "Todo"),
    h("input", {
      value: input,
      oninput: e => setInput(e.target.value)
    }),
    h("button", { onclick: add }, "Add"),

    h("ul", null,
      todos.map(t =>
        h("li", { key: t.id },
          t.text,
          h("button", { onclick: () => del(t.id) }, "X")
        )
      )
    )
  );
  */

return h("div", { className: "todo-app" },
  h("h1", { className: "todo-title" }, "Todo"),

  h("div", { className: "todo-input-row" },
    h("input", {
      className: "todo-input",
      value: input,
      placeholder: "What needs to be done?",
      oninput: e => setInput(e.target.value)
    }),
    h("button", {
      className: "todo-add-btn",
      onclick: add
    }, "Add")
  ),

  loading
    ? h("p", { className: "todo-loading" }, "Loading…")
    : h("ul", { className: "todo-list" },
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











