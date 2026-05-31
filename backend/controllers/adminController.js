const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const Store = require("../models/Store.js");
const Rating = require("../models/Rating.js");

// -- CREATE USER --
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, address, role: role.toUpperCase() });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
};

// -- UPDATE USER --
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updateData = {
        name, 
        email, 
        address, 
        role: role?.toUpperCase() || user.role 
    };

    if (password && password.trim() !== "") {
        updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -- DELETE USER --
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ success: true });
  } catch (err) {
     console.error(err);
     res.status(500).json({ error: "Server error" });
  }
};

// -- CREATE STORE --
exports.createStore = async (req, res) => {
  try {
    const { name, address, ownerId } = req.body;

    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== "OWNER") {
      return res.status(400).json({ error: "Invalid ownerId" });
    }

    const store = await Store.create({ name, address, ownerId: ownerId});
    res.status(201).json(store);
  } catch (err) { console.error(err); 
    res.status(500).json({ error: "Server error" }); }
};

// -- UPDATE STORE --
exports.updateStore = async (req, res) => {
  try {
    const { name, address, ownerId } = req.body;
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== "OWNER") {
        return res.status(400).json({ error: "Invalid ownerId" });
      }
    }

    await store.update({ name, address, ownerId: ownerId });
    res.json({ success: true, store });
  } catch (err) {
     console.error(err);
     res.status(500).json({ error: "Server error" });
  }
};

// -- DELETE STORE --
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    await store.destroy();
    res.json({ success: true });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
  }
};

// -- GET STATS --
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
};

// -- LIST USERS --
exports.getUsers = async (req, res) => {
  try {
    const { q, role, sort = "name", order = "ASC", page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (q) where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } }
    ];
    if (role) where.role = role;
    const offset = (page - 1) * limit;

    const sortableFields = ["name", "email", "address", "role"];
    const sortField = sortableFields.includes(sort) ? sort : "name";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const result = await User.findAndCountAll({
      where, 
      order: [[sortField, sortOrder]],
      limit: parseInt(limit), 
      offset: parseInt(offset)
    });

    res.json({ count: result.count, rows: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
};

// -- LIST STORES --
exports.getStores = async (req, res) => {
  try {
    // use raw SQL or Sequelize include/aggregation
    const { q, sort = "name", order = "ASC", page = 1, limit = 20 } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const sortableFields = ["name", "address", "ownerId", "email"];
    const sortField = sortableFields.includes(sort) ? sort : "name";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let orderClause = [[sortField, sortOrder]];
    if (sort === 'email') {
        orderClause = [[{ model: User, as: 'owner' }, 'email', sortOrder]];
    }

    // naive: fetch stores then compute ratings
    const stores = await Store.findAll({ 
      where, 
      limit: parseInt(limit), 
      offset: parseInt(offset), 
      order: orderClause,
      include: [
        { model: User, as: "owner", attributes: ["id", "name", "email"] }
      ]
    });
    const storesWithRating = await Promise.all(
      stores.map(async (s) => {
        const avg = await Rating.findAll({
           where: { storeId: s.id }, 
           attributes: [[Rating.sequelize.fn('AVG', Rating.sequelize.col('value')), 'avgRating']] 
      });

      const avgRating = avg[0]?.dataValues?.avgRating 
        ? parseFloat(avg[0].dataValues.avgRating).toFixed(2) 
        : null;

      return { 
        id: s.id, 
        name: s.name, 
        address: s.address, 
        rating: avgRating,
        owner: s.owner ? {
          id: s.owner.id,
          name: s.owner.name,
          email: s.owner.email,
        } : null 
      };
    })
  );
    res.json(storesWithRating);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
};
