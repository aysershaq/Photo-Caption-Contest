module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Captions", {
      fields: ["imageId", "userId"],
      type: "unique",
      name: "unique_caption_per_user_per_image",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Captions", "unique_caption_per_user_per_image");
  },
};