// src/main.js
import './framework/Debugger.js';
import './framework/vdom.js';
import './framework/hooks.js';
import './framework/router.js';
//import './framework/init_API.js';

import { TodoApp } from './pages/TodoApp.js';

const { render } = window.App.VDOM;

render(TodoApp, document.getElementById('root'));