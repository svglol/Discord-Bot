module.exports = (sequelize, DataTypes) => {
  return sequelize.define('sound_commands', {
    command: DataTypes.INTEGER,
    file: DataTypes.STRING,
    volume: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    date: DataTypes.INTEGER
  }, {
    timestamps: false
  });
};
