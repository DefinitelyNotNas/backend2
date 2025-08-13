// routes/users.js (CommonJS)
const { Router } = require("express");
const { q } = require("../db");

const r = Router();

/**
 * POST /users
 * body: { email, passwordHash, firstName, lastName, phone?, pcoPersonId }
 */
r.post("/", async (req, res) => {
	const {
		email,
		passwordHash,
		firstName,
		lastName,
		phone,
		pcoPersonId,
	} = req.body || {};
	if (
		!email ||
		!passwordHash ||
		!firstName ||
		!lastName ||
		!pcoPersonId
	) {
		return res.status(400).json({ error: "Missing required fields" });
	}
	try {
		const { rows } = await q(
			`INSERT INTO users (email, password_hash, first_name, last_name, phone, pco_person_id)
             VALUES ($1,$2,$3,$4,$5,$6)
             RETURNING id, email, first_name, last_name, phone, pco_person_id, created_at`,
			[
				email,
				passwordHash,
				firstName,
				lastName,
				phone ?? null,
				pcoPersonId,
			]
		);
		res.status(201).json(rows[0]);
	} catch (e) {
		if (e && e.code === "23505") {
			return res
				.status(409)
				.json({ error: "Email or PCO person already exists" });
		}
		res.status(500).json({ error: "Failed to create user" });
	}
});

/** GET /users/by-email/search?email= */
r.get("/by-email/search", async (req, res) => {
	const { email } = req.query;
	if (!email)
		return res.status(400).json({ error: "email required" });
	try {
		const { rows } = await q(
			`SELECT id, email, first_name, last_name, phone, pco_person_id, created_at FROM users WHERE email=$1`,
			[email]
		);
		if (!rows[0]) return res.status(404).json({ error: "Not found" });
		res.json(rows[0]);
	} catch {
		res.status(500).json({ error: "Failed to fetch user by email" });
	}
});

/** GET /users/:id */
r.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await q(
			`SELECT id, email, first_name, last_name, phone, pco_person_id, created_at FROM users WHERE id=$1`,
			[id]
		);
		if (!rows[0]) return res.status(404).json({ error: "Not found" });
		res.json(rows[0]);
	} catch {
		res.status(500).json({ error: "Failed to fetch user" });
	}
});

/** PATCH /users/:id  — update profile */
r.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const { firstName, lastName, phone } = req.body || {};
	try {
		const { rows } = await q(
			`UPDATE users
             SET first_name = COALESCE($1, first_name),
                 last_name  = COALESCE($2, last_name),
                 phone      = COALESCE($3, phone)
             WHERE id=$4
             RETURNING id, email, first_name, last_name, phone, pco_person_id, created_at`,
			[firstName ?? null, lastName ?? null, phone ?? null, id]
		);
		if (!rows[0]) return res.status(404).json({ error: "Not found" });
		res.json(rows[0]);
	} catch {
		res.status(500).json({ error: "Failed to update user" });
	}
});

r.post("/api/users/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Find user by email
		const user = await db.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);

		if (user.rows.length === 0) {
			return res
				.status(401)
				.json({ message: "Invalid email or password" });
		}

		// Compare password with hashed password
		const isValidPassword = await bcrypt.compare(
			password,
			user.rows[0].password_hash
		);

		if (!isValidPassword) {
			return res
				.status(401)
				.json({ message: "Invalid email or password" });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.rows[0].id, email: user.rows[0].email },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Return token and user data
		res.status(200).json({
			token,
			user: {
				id: user.rows[0].id,
				email: user.rows[0].email,
				first_name: user.rows[0].first_name,
				last_name: user.rows[0].last_name,
				phone: user.rows[0].phone,
				pco_person_id: user.rows[0].pco_person_id,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

module.exports = r;
