import '../framework/Debugger.js';
import '../framework/vdom.js';
import '../framework/hooks.js';
import '../framework/router.js';
//import '../framework/init_API.js';

/*
import { TodoApp } from './pages/TodoApp.js';
window.App.VDOM.render(TodoApp, document.getElementById('app'));
*/

import { TodoApp } from "./pages/TodoApp.js";
import { fetchTodos } from "../shared/api.js";

const { Router } = window.App;

//Router.addRoute("/", TodoApp);

Router.addRoute({
  path: "/",
  component: TodoApp,
/*
  loader: async () => {
    const todos = await fetchTodos();
    return { todos };
  }
*/
loader: async () => {
  if (window.__CACHE__?.todos) {
    return window.__CACHE__.todos;
  }

  const todos = await fetchTodos();
  window.__CACHE__ = { todos };
  return { todos };
}

});






Router.init(document.getElementById("app"), { hash: false });