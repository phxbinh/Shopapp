// src/server/db.js
import { sql } from "@neondatabase/serverless";

export async function getTodos() {
  const { rows } = await sql`
    SELECT id, text
    FROM todos
    ORDER BY id DESC
  `;
  return rows;
}

export async function addTodo(text) {
  await sql`INSERT INTO todos (text) VALUES (${text})`;
}

export async function deleteTodo(id) {
  await sql`DELETE FROM todos WHERE id = ${id}`;
}