module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_sounboard', {
		user_id: DataTypes.STRING,
		date: DataTypes.INTEGER,
    command: DataTypes.STRING
	}, {
		timestamps: false,
	});
};
