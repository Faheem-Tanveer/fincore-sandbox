const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Missing or invalid Authorization header",
    });
  }

  // 🔥 Robust token extraction (handles "Bearer <token>" and "Bearer Bearer <token>")
  const parts = authHeader.split(" ");
  const token = parts.length === 3 ? parts[2] : parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      code: "TOKEN_INVALID",
      message:
        err.name === "TokenExpiredError"
          ? "Token has expired"
          : "Invalid token",
    });
  }
};