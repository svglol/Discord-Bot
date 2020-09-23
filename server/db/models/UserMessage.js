module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user_message', {
    user_id: DataTypes.STRING,
    date: DataTypes.INTEGER
  }, {
    timestamps: false
  });
};
