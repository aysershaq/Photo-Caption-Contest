"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Images", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      caption: { 
      type: Sequelize.STRING
    },
    imageUrl: { 
      
      type: Sequelize.STRING, 
      allowNull: false 
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
    await queryInterface.addColumn("Images", "captionByUserId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("images");
  },
};
