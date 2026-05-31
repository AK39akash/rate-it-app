const sequelize = require("./db.js");
const bcrypt = require("bcryptjs");
const User = require("./models/User.js");
const Store = require("./models/Store.js");
const Rating = require("./models/Rating.js");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync({ force: true });
    console.log("Tables synced");
    
    const adminPass = await bcrypt.hash("Admin@123!", 10);
    const ownerPass = await bcrypt.hash("Owner@123!", 10);
    const userPass = await bcrypt.hash("User@123!", 10);

    const admin = await User.create({ name: "Administrator Name Long Enough", email: "admin@example.com", passwordHash: adminPass, address: "Admin address", role: "ADMIN" });
    const owner = await User.create({ name: "Store Owner Long Enough Name", email: "owner@example.com", passwordHash: ownerPass, address: "Owner address", role: "OWNER" });
    const user = await User.create({ name: "Normal User Long Enough Name", email: "user@example.com", passwordHash: userPass, address: "User address", role: "USER" });

    const s1 = await Store.create({ name: "Sunrise Mart", email: "sunrise@example.com", address: "Pune", ownerId: owner.id });
    const s2 = await Store.create({ name: "Daily Essentials", email: "daily@example.com", address: "Mumbai", ownerId: owner.id });

    await Rating.create({ userId: user.id, storeId: s1.id, value: 4 });
    await Rating.create({ userId: user.id, storeId: s2.id, value: 5 });

    console.log("Seed done");
    process.exit(0);
  } catch (err) { console.error(err); process.exit(1); }
})();
