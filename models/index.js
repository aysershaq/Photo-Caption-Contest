'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// مثال: models/index.js بعد تعريف الموديلات
// Caption <-> Vote
db.Captions.hasMany(db.Votes, { foreignKey: "captionId", as: "votes" });
db.Votes.belongsTo(db.Captions, { foreignKey: "captionId", as: "caption" });

db.Users.hasMany(db.Votes, { foreignKey: "userId", as: "userVotes" });
db.Votes.belongsTo(db.Users, { foreignKey: "userId", as: "user" });




db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
