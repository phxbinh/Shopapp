import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const query = () =>
  sql`SELECT * FROM todos ORDER BY id DESC`;

export const add = (text) =>
  sql`INSERT INTO todos (text) VALUES (${text})`;

export const remove = (id) =>
  sql`DELETE FROM todos WHERE id = ${id}`;