const path = require('path');

module.exports = {
  database: 'trackit_db',
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'), // This puts it in backend folder
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
