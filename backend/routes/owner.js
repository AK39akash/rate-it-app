const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const Rating = require("../models/Rating");
const User = require("../models/User");
const Store = require("../models/Store");
const bcrypt = require("bcryptjs");

const router = express.Router();

// ✅ Get raters for owner's store
router.get("/store/:storeId/raters", authenticate, authorize("OWNER"), async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ error: "Store not found" });

    if (req.user.role !== "OWNER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (req.user.role === "OWNER" && store.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Not your store" });
    }

    const rows = await Rating.sequelize.query(
      `SELECT r.id, r.value, u.id as userId, u.name, u.email 
       FROM Ratings r 
       JOIN Users u ON r.userId = u.id 
       WHERE r.storeId = :storeId`,
      { replacements: { storeId }, type: Rating.sequelize.QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update password
router.put("/update-password", authenticate, authorize("OWNER"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
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
});

module.exports = router;
