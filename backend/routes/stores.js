const express = require("express");
const { Op } = require("sequelize");
const Store = require("../models/Store.js");
const Rating = require("../models/Rating.js");
const { authenticate } = require("../middleware/auth.js");
const authMiddleware = require("../middleware/auth.js");
const User = require("../models/User.js");

const router = express.Router();

const sequelize = require("../db.js");

// GET /api/stores?q=&sort=&order=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const { q, sort = "name", order = "ASC", page = 1, limit = 20 } = req.query;
    const where = {};
    if (q) where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } }
    ];

    const offset = (page - 1) * limit;

    let orderClause = [[sort, order]];
    let includeClause = [];
    let groupClause = undefined;
    let attributes = undefined; // Default attributes (all)
    let subQuery = undefined;

    if (sort === 'rating') {
        const ratingCol = [sequelize.fn("AVG", sequelize.col("Ratings.value")), "avgRating"];
        // We include all Store attributes plus the avgRating
        attributes = { 
            include: [ ratingCol ] 
        };
        includeClause = [{ model: Rating, attributes: [] }];
        groupClause = ['Store.id'];
        orderClause = [[sequelize.col("avgRating"), order]];
        subQuery = false; 
    }

    const stores = await Store.findAll({ 
      attributes,
      where, 
      include: includeClause,
      group: groupClause,
      limit: parseInt(limit), 
      offset: parseInt(offset), 
      order: orderClause,
      subQuery
    });

    // Post-process to ensure consistent format (though strictly speaking avgRating is already there if sorted)
    // We keep existing logic for mapping to ensure compatibility, or we can use the value we just got.
    // The existing logic re-queries ratings. To save time/risk, we'll leave the re-query logic 
    // BUT we should respect the order we just got.
    
    // Optimization: If we already have avgRating, use it.
    const result = await Promise.all(stores.map(async s => {
      let avgRating = s.dataValues.avgRating ? parseFloat(s.dataValues.avgRating).toFixed(2) : null;
      
      // Fallback if not sorting by rating (so avgRating might not be in attributes)
      if (sort !== 'rating') {
          const avgRow = await Rating.findAll({ where: { storeId: s.id }, attributes: [[Rating.sequelize.fn('AVG', Rating.sequelize.col('value')), 'avgRating']] });
          avgRating = avgRow[0]?.dataValues?.avgRating ? parseFloat(avgRow[0].dataValues.avgRating).toFixed(2) : null;
      }
      return { id: s.id, name: s.name, address: s.address, email: s.email, avgRating };
    }));

    res.json({
      success: true,
      stores: result,
      total: await Store.count({ where })
    });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});


router.get("/my-stores", authenticate, authMiddleware.authorize("OWNER"), async (req, res) => {
  try {
    
    const userId = req.user.id;

    const stores = await Store.findAll({
      where: { ownerId: userId },
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });

    if (!stores) {
      return res.status(404).json({ message: "No store found for this user" });
    }

    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET store detail + user's rating
router.get("/:id", authenticate, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    const avgRow = await Rating.findAll({ where: { storeId: store.id }, attributes: [[Rating.sequelize.fn('AVG', Rating.sequelize.col('value')), 'avgRating']] });
    const avgRating = avgRow[0]?.dataValues?.avgRating ? parseFloat(avgRow[0].dataValues.avgRating).toFixed(2) : null;
    let userRating = null;
    if (req.user) {
      const r = await Rating.findOne({ where: { storeId: store.id, userId: req.user.id }});
      if (r) userRating = r.value;
    }
    res.json({ id: store.id, name: store.name, address: store.address, avgRating, userRating });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});


module.exports = router;
