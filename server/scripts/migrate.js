"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function runMigration() {
	const migrationFilePath = path.resolve(
		__dirname,
		"..",
		"migrations",
		"001_init.sql"
	);
	const sql = fs.readFileSync(migrationFilePath, "utf8");

	console.log(`Applying migration from ${migrationFilePath}`);
	await pool.query("BEGIN");
	try {
		await pool.query(sql);
		await pool.query("COMMIT");
		console.log("Migration completed successfully.");
	} catch (error) {
		await pool.query("ROLLBACK");
		console.error("Migration failed:", error.message);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
}

runMigration();
