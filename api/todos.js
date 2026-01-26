import { query, add, remove } from '../src/server/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const todos = await query();
    return res.json(todos);
  }

  if (req.method === 'POST') {
    const { text } = req.body;
    await add(text);
    return res.status(201).end();
  }

  if (req.method === 'DELETE') {
    await remove(req.query.id);
    return res.status(204).end();
  }

  res.status(405).end();
}