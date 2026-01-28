
/*
const { h } = window.App.VDOM;
const { useState, useEffect } = window.App.Hooks;
const { useLoader } = window.App;
import { fetchTodos, createTodo, removeTodo } from "../../shared/api.js";
*/

// src/app/pages/TodoApp.js
export function TodoApp_({ data, status }) {
  /*
  const [input, setInput] = useState("");

  // 🔥 BẮT BUỘC: sync loader → state
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    if (Array.isArray(data?.todos)) {
      setTodos(data.todos);
    }
  }, [data]);
  */


  if (status === "loading") {
    return h("p", null, "Loading todos...");
  }

  if (status === "error") {
    return h("p", { style: { color: "red" } }, "Failed to load todos");
  }

  const [input, setInput] = useState("");
  //const todos = data?.todos || [];
  
  // 🔥 BẮT BUỘC: sync loader → state
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    if (Array.isArray(data?.todos)) {
      setTodos(data.todos);
    }
  }, [data, window.__CACHE__]);


/*
const { data, status, reload } = useLoader();

  if (status === "loading") {
    return h("p", null, "Loading...");
  }
*/


  async function add() {
    if (!input.trim()) return;
    await createTodo(input);
    setInput("");
    delete window.__CACHE__;   // 🔥 FIX
    //await App.Router.reload();
    //reload();
  }
  
  async function del(id) {
    await removeTodo(id);
    delete window.__CACHE__;   // 🔥 FIX
    //await App.Router.reload();
    //reload();
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




// src/app/pages/TodoApp.js
export function TodoApp__() {
  alert("TodoApp")

const { data, status, reload } = useLoader(fetchTodos);
const [input, setInput] = useState("");

  if (status === "loading") {
    return h("p", null, "Loading...");
  }

//alert(JSON.stringify(data))


  async function add() {
    if (!input.trim()) return;
    await createTodo(input);
    setInput("");
    //delete window.__CACHE__;   // 🔥 FIX
    //await App.Router.reload();
    reload();
  }
  
  async function del(id) {
    await removeTodo(id);
    //delete window.__CACHE__;   // 🔥 FIX
    //await App.Router.reload();
    reload();
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
      data.todos.map(t =>
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




const { h } = window.App.VDOM;
const { useState } = window.App.Hooks;
const { useLoader } = window.App;

import { fetchTodos, createTodo, removeTodo } from "../../shared/api.js";

export function TodoApp() {
  const { data, status, reload } = useLoader(fetchTodos);
  const [input, setInput] = useState("");

  if (status === "loading") {
    return h("p", null, "Loading...");
  }

  async function add() {
    if (!input.trim()) return;
    await createTodo(input);
    setInput("");
    reload(); // 🔥 only refetch data
  }

  async function del(id) {
    await removeTodo(id);
    reload();
  }

  return h("div", { className: "todo-app" },
    h("h1", null, "Todo"),
    h("input", {
      value: input,
      oninput: e => setInput(e.target.value)
    }),
    h("ul", null,
      data.todos.map(t =>
        h("li", { key: t.id }, t.text)
      )
    )
  );
}








