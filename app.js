require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const cors = require("cors");

// --- Database connection ---
const client = require("./server/db");

// --- Express App Setup ---
const app = express();

// --- CORS Middleware ---
app.use(cors());

// --- JSON Parsing & Logging ---
app.use(express.json());
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

// --- API Routes ---
app.use("/api", require("./server/routes"));

// --- Start Server ---
const PORT = process.env.PORT || 3000;

const init = async () => {
	try {
		// Validate DB connectivity
		await client.query("SELECT 1");
		console.log("Connected to PostgreSQL");

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("DB connection error:", error);
		process.exit(1);
	}
};

// Only start the server when run directly
init();

module.exports = app;
