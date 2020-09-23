module.exports = (sequelize, DataTypes) => {
  return sequelize.define('gif_commands', {
    command: DataTypes.STRING,
    link: DataTypes.STRING,
    date: DataTypes.INTEGER
  }, {
    timestamps: false
  });
};
