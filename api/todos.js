// api/todos.js
import { getTodos, addTodo, deleteTodo } from "../src/server/db.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(await getTodos());
  }

  if (req.method === "POST") {
    const { text } = JSON.parse(req.body);
    await addTodo(text);
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = JSON.parse(req.body);
    await deleteTodo(id);
    return res.json({ ok: true });
  }

  res.status(405).end();
}