const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");


const User = sequelize.define("User", {
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  address: { type: DataTypes.STRING(400), allowNull: true },
  role: { type: DataTypes.ENUM("ADMIN", "USER", "OWNER"), defaultValue: "USER",
  allowNull: false,
   }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ["email"] },
  ],
});

module.exports = User;
