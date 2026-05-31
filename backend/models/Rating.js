const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const User = require("./User.js");
const Store = require("./Store.js");

const Rating = sequelize.define("Rating", {
  value: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } }
}, {});

Rating.belongsTo(User, { foreignKey: "userId" });
Rating.belongsTo(Store, { foreignKey: "storeId" });
User.hasMany(Rating, { foreignKey: "userId" });
Store.hasMany(Rating, { foreignKey: "storeId" });

module.exports = Rating;
