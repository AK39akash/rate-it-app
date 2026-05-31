const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User.js");
const { registrationValidators } = require("../middleware/validate.js");
const authMiddleware = require("../middleware/auth.js")

const router = express.Router();

// Register (normal user)
router.post("/register", registrationValidators, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, address, role: "USER" });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// Login (all roles)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "8h" }
    );
    
    return res.json({ 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) { next(err); } 
});

router.put(
  "/user/update-password",
  authMiddleware.authenticate,
  authMiddleware.authorize("USER"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password too short" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.update(
        { passwordHash: hashedPassword },
        { where: { id: userId } }
      );

      res.json({ success: true, message: "Password Updated Successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.get("/me", authMiddleware.authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "address"]
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;