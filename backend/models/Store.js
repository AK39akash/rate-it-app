const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const User = require("./User.js");

const Store = sequelize.define("Store", {
  name: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.STRING(400), allowNull: true }
}, {
    timestamps: false
});

Store.belongsTo(User, { as: "owner", foreignKey: "ownerId", }); // optional owner link

module.exports = Store;
