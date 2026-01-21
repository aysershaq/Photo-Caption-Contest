// models/votes.js
module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define(
    "Votes",
    {
      captionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Votes",
      timestamps: true,   // createdAt / updatedAt camelCase
      underscored: false, // ❌ مهم جدًا
    }
  );

  return Vote;
};
