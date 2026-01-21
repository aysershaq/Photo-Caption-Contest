"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Captions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      text: { 
      type: Sequelize.STRING,
      allowNull: false,
    },
    userId: { 
      
      type: Sequelize.INTEGER, 
      allowNull: false ,
       references: {
        model: "Users",
        key: "id",
      },
    },
     imageId: { 
      
      type: Sequelize.INTEGER, 
      allowNull: false,
       references: {
        model: "Images",
        key: "id",
      },
    },
   
    
      // user_id: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   references: { model: "Users", key: "id" },
      //   onUpdate: "CASCADE",
      //   onDelete: "CASCADE",
      // },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    
  },

 
  async down(queryInterface) {
    await queryInterface.dropTable("Captions");
  },
};
