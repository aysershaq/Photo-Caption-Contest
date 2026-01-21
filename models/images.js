const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');
module.exports = (sequelize, DataTypes) => {
const Images = sequelize.define(
  'Images',
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
    
      autoIncrement:true,
      primaryKey:true
    },
    
    imageData: { 
      
      type:  DataTypes.BLOB('long'), 
      alowNull:false
    },
    
    
  }
  
);

  return Images ; 
}