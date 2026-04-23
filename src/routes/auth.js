const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: faheem
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: "error", code: "MISSING_FIELDS", message: "username and password are required" });
  }

  const user = db.get("users").find({ username }).value();

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ status: "error", code: "INVALID_CREDENTIALS", message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return res.status(200).json({
    status: "success",
    data: { token, tokenType: "Bearer", expiresIn: process.env.JWT_EXPIRES_IN, user: { id: user.id, username: user.username, name: user.name } },
  });
});

module.exports = router;