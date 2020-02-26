module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		lastConnection: {
			type: DataTypes.STRING,
			defaultValue: '0'
		},
	}, {
		timestamps: false,
	});
};
