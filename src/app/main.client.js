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

const { Router } = window.App;

Router.addRoute("/", TodoApp);
Router.init(document.getElementById("app"), { hash: false });