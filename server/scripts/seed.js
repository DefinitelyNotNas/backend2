"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function runSeed() {
	const seedFilePath = path.resolve(
		__dirname,
		"..",
		"seeds",
		"seed.sql"
	);
	const sql = fs.readFileSync(seedFilePath, "utf8");

	console.log(`Running seed from ${seedFilePath}`);
	await pool.query("BEGIN");
	try {
		await pool.query(sql);
		await pool.query("COMMIT");
		console.log("Seeding completed successfully.");
	} catch (error) {
		await pool.query("ROLLBACK");
		console.error("Seeding failed:", error.message);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
}

runSeed();
