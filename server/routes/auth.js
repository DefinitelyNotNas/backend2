const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { q } = require("../db");
const {
	generateAccessToken,
	generateRefreshToken,
} = require("../auth/generateTokens");
const {
	saveRefreshToken,
	getRefreshToken,
	deleteRefreshToken,
} = require("../auth/tokenStore");

const r = Router();

const ACCESS_SECRET = "this-is-a-church-app-and-im-so-confused-lol";

//Auth/me

//Auth/refresh

//Auth/logout
