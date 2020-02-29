module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		lastConnection: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		intro: DataTypes.STRING,
		exit: DataTypes.STRING,
	}, {
		timestamps: false,
	});
};
