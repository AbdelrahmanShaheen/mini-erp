const prisma = require("../prisma/prisma");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const router = new express.Router();

module.exports = router;
