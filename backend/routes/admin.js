const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.js");
const { registrationValidators } = require("../middleware/validate.js");
const adminController = require("../controllers/adminController.js");

const router = express.Router();

// -- USERS --
// Create user
router.post("/users", authenticate, authorize("ADMIN"), registrationValidators, adminController.createUser);

// Update user
router.put("/users/:id", authenticate, authorize("ADMIN"), adminController.updateUser);

// Delete user
router.delete("/users/:id", authenticate, authorize("ADMIN"), adminController.deleteUser);

// List users
router.get("/users", authenticate, authorize("ADMIN"), adminController.getUsers);


// -- STORES --
// Create store
router.post("/stores", authenticate, authorize("ADMIN"), adminController.createStore);

// Update store
router.put("/stores/:id", authenticate, authorize("ADMIN"), adminController.updateStore);

// Delete store
router.delete("/stores/:id", authenticate, authorize("ADMIN"), adminController.deleteStore);

// List stores
router.get("/stores", authenticate, authorize("ADMIN"), adminController.getStores);


// -- STATS --
router.get("/stats", authenticate, authorize("ADMIN"), adminController.getStats);


module.exports = router;
