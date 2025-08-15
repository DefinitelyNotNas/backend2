const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const ACCESS_SECRET = "candyshop463";
const ACCESS_EXPIRES_IN = "15m";

const generateAccess = (userId) => {
	return jwt.sign({ userId }, ACCESS_SECRET, {
		expiresIn: ACCESS_EXPIRES_IN,
	});
};

const generateRefresh = () => {
	return uuidv4();
};

module.exports = {
	generateAccess,
	generateRefresh,
};
