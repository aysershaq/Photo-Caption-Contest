const path = require('path');
require('dotenv').config({
  path: [
    path.resolve(__dirname, '../.env.production'),
    path.resolve(__dirname, '../.env'),
  ],
  override: true, // يخلي الأخير يفوز أو حسب ترتيبك
});
 
 module.exports = {
   development: {
     username: process.env.DB_USER || 'postgres',
     password: process.env.DB_PASS || 'postgres',
     database: process.env.DB_USER || "Photo-Caption",
     host: process.env.DB_HOST || 'localhost',
     dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "Photo-Caption",
    host: "localhost",
    dialect: "postgres",
  },
  production: {
    use_env_variable: 'DB_URL',
    dialect: "postgres",
      dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  },
};
