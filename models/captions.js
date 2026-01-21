// models/captions.js
module.exports = (sequelize, DataTypes) => {
  const Caption = sequelize.define(
    "Captions",
    {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Captions",
      timestamps: true,
      underscored: false, // ❌ مهم
    }
  );

  return Caption;
};
