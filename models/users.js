const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');


module.exports = (sequelize, DataTypes) => {
const Users = sequelize.define(
  'Users',
  {
    // Model attributes are defined here
       id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
       username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:false
      
      },
   email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role:{
        type:DataTypes.STRING,
        defaultValue:"user"
      }

  },
  {
    // Other model options go here
  },
);
// إن وجد جدول للتصويتات


  return Users;
}