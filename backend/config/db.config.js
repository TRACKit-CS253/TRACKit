const path = require('path');

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'trackit_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'trackit_db',
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// const path = require('path');

// module.exports = {
//   database: 'trackit_db',
//   dialect: 'sqlite',
//   storage: path.join(__dirname, '../database.sqlite'),
//   logging: false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };
