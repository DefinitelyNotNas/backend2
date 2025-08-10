// routes/tags.js (CommonJS)
const { Router } = require("express");
const { q } = require("../db");

const r = Router();

/** POST /tags  body: { name } */
r.post("/", async (req, res) => {
	const { name } = req.body || {};
	if (!name) return res.status(400).json({ error: "name required" });
	try {
		const { rows } = await q(
			`INSERT INTO tags (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name`,
			[name]
		);
		res.status(201).json(rows[0]);
	} catch {
		res.status(500).json({ error: "Failed to create tag" });
	}
});

/** GET /tags */
r.get("/", async (_req, res) => {
	const { rows } = await q(`SELECT id, name FROM tags ORDER BY name`);
	res.json(rows);
});

module.exports = r;
