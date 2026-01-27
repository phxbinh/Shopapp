/*
// api/todos.js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const todos = await sql`SELECT * FROM todos ORDER BY id DESC`;
      return res.status(200).json(todos);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

      await sql`INSERT INTO todos (text) VALUES (${body.text})`;
      return res.status(201).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

      await sql`DELETE FROM todos WHERE id = ${body.id}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
*/

import { getTodos, addTodo, deleteTodo } from "../src/server/db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const todos = await getTodos();
      return res.status(200).json(todos);
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    if (req.method === "POST") {
      await addTodo(body);
      return res.status(201).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await deleteTodo(body);
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}



