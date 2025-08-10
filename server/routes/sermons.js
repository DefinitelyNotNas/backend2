// routes/sermons.js (CommonJS)
const { Router } = require("express");
const { q } = require("../db");

const r = Router();

/** POST /sermons  body: { title, youtubeUrl, youtubeVideoId, description?, preacherName?, recordedAt? } */
r.post("/", async (req, res) => {
	const {
		title,
		youtubeUrl,
		youtubeVideoId,
		description,
		preacherName,
		recordedAt,
	} = req.body || {};
	if (!title || !youtubeUrl || !youtubeVideoId)
		return res
			.status(400)
			.json({ error: "title, youtubeUrl, youtubeVideoId required" });

	try {
        const { rows } = await q(
            `INSERT INTO preachings (title, youtube_url, youtube_video_id, description, preacher_name, recorded_at)
             VALUES ($1,$2,$3,$4,$5,$6)
             RETURNING id, title, youtube_url, youtube_video_id, description, preacher_name, recorded_at, created_at`,
			[
				title,
				youtubeUrl,
				youtubeVideoId,
				description ?? null,
				preacherName ?? null,
				recordedAt ?? null,
			]
		);
		res.status(201).json(rows[0]);
	} catch (e) {
		if (e.code === "23505")
			return res
				.status(409)
				.json({ error: "youtube_video_id must be unique" });
		res.status(500).json({ error: "Failed to create preaching" });
	}
});

/** GET /sermons?q=grace */
r.get("/", async (req, res) => {
	const qstr = (req.query.q || "").toString().trim();
	if (!qstr) {
		const { rows } = await q(
			`SELECT id, title, youtube_url, youtube_video_id, description, preacher_name, recorded_at, created_at
         FROM preachings
        ORDER BY recorded_at DESC NULLS LAST, id DESC`
		);
		return res.json(rows);
	}
	const { rows } = await q(
		`SELECT id, title, youtube_url, youtube_video_id, description, preacher_name, recorded_at, created_at
       FROM preachings
      WHERE title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%'
      ORDER BY recorded_at DESC NULLS LAST, id DESC`,
		[qstr]
	);
	res.json(rows);
});

/** GET /sermons/:id */
r.get("/:id", async (req, res) => {
	const { id } = req.params;
	const { rows } = await q(
		`SELECT id, title, youtube_url, youtube_video_id, description, preacher_name, recorded_at, created_at
       FROM preachings WHERE id=$1`,
		[id]
	);
	if (!rows[0]) return res.status(404).json({ error: "Not found" });
	res.json(rows[0]);
});

/** POST /sermons/:id/tags — attach tags by name (creates tags if missing)
 * body: { names: ["faith","grace"] }
 */
r.post("/:id/tags", async (req, res) => {
	const { id } = req.params;
	const { names } = req.body || {};
	if (!Array.isArray(names) || names.length === 0)
		return res.status(400).json({ error: "names array required" });

	try {
		// create tags if they don't exist
		for (const n of names) {
			await q(
				`INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
				[n]
			);
		}
		// fetch their ids
		const { rows: tagRows } = await q(
			`SELECT id, name FROM tags WHERE name = ANY($1::text[])`,
			[names]
		);
        // attach to preaching
		for (const t of tagRows) {
			await q(
				`INSERT INTO preaching_topics (preaching_id, tag_id)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`,
				[id, t.id]
			);
		}
		res.json({ ok: true, attached: tagRows.map((x) => x.name) });
	} catch {
		res.status(500).json({ error: "Failed to attach tags" });
	}
});

/** GET /sermons/:id/tags */
r.get("/:id/tags", async (req, res) => {
	const { id } = req.params;
	const { rows } = await q(
		`SELECT t.id, t.name
       FROM preaching_topics pt
       JOIN tags t ON t.id = pt.tag_id
      WHERE pt.preaching_id=$1
      ORDER BY t.name`,
		[id]
	);
	res.json(rows);
});

module.exports = r;
