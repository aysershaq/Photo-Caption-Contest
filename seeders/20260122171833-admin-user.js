"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // تحقق هل يوجد admin بالفعل
    const admins = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE role = 'admin' LIMIT 1;`
    );

    if (admins[0].length > 0) {
      console.log("Admin already exists, skipping seeder.");
      return;
    }

    const password = "Admin@123"; // غيّرها لاحقًا
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await queryInterface.bulkInsert("Users", [
      {
        username: "admin",
        email: "Ayser.shaqruni@gmail.com",
        passwordHash,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("Admin user created successfully");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", {
      email: "admin@example.com",
    });
  },
};
