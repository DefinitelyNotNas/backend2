// routes/communities.js (CommonJS)
const { Router } = require("express");
const { q } = require("../db");

const r = Router();

/** POST /communities  body: { name, description?, pcoGroupId } */
r.post("/", async (req, res) => {
  const { name, description, pcoGroupId } = req.body || {};
  if (!name || !pcoGroupId) return res.status(400).json({ error: "name and pcoGroupId required" });
  try {
    const { rows } = await q(
      `INSERT INTO communities (name, description, pco_group_id)
       VALUES ($1,$2,$3)
       RETURNING id, name, description, pco_group_id, created_at`,
      [name, description ?? null, pcoGroupId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e && e.code === "23505") return res.status(409).json({ error: "pco_group_id must be unique" });
    res.status(500).json({ error: "Failed to create community" });
  }
});

/** GET /communities */
r.get("/", async (_req, res) => {
  const { rows } = await q(
    `SELECT id, name, description, pco_group_id, created_at
     FROM communities
     ORDER BY created_at DESC, id DESC`
  );
  res.json(rows);
});

/** GET /communities/:id */
r.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await q(
    `SELECT id, name, description, pco_group_id, created_at FROM communities WHERE id=$1`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

/** POST /communities/:id/members  body: { userId } */
r.post("/:id/members", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    await q(
      `INSERT INTO community_memberships (user_id, community_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [userId, id]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to add member" });
  }
});

/** GET /communities/:id/members */
r.get("/:id/members", async (req, res) => {
  const { id } = req.params;
  const { rows } = await q(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone
       FROM community_memberships cm
       JOIN users u ON u.id = cm.user_id
      WHERE cm.community_id = $1
      ORDER BY u.last_name, u.first_name`,
    [id]
  );
  res.json(rows);
});

module.exports = r;

