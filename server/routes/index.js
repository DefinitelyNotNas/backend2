const express = require("express");
const router = express.Router();

// Use the routes defined in the other route files
router.use("/users", require("./users.js"));
router.use("/communities", require("./communities.js"));
router.use("/tags", require("./tags.js"));
router.use("/sermons", require("./sermons.js"));

// Base route for the API

router.get("/", (req, res) => {
	res.send("Hello World From Router api/index.js");
});

module.exports = router;
