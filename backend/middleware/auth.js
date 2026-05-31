// verify JWT and attach req.user { id, role }
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) { return res.status(401).json({ error: "Invalid token" }); }
}

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send({ error: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).send({ error: "Forbidden" });
    next();
  };
}

module.exports = { authenticate, authorize };