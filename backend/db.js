// backend/db.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 10000,
  },
  retry: {
    max: 5,
  },
})

module.exports = sequelize;
