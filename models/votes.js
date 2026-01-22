module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define(
    "Votes",
    {
      vote_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "vote_id",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      captionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Votes",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Vote;
};
