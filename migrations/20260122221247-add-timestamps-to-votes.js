'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.removeConstraint("Captions", "Captions_imageId_fkey");

await queryInterface.addConstraint("Captions", {
  fields: ["imageId"],
  type: "foreign key",
  name: "Captions_imageId_fkey",
  references: {
    table: "Images",
    field: "id",
  },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})
  },
  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }

}