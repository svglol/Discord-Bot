module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('user', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		lastConnection: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		username: DataTypes.STRING,
		intro: DataTypes.STRING,
		exit: DataTypes.STRING,
		adminPermission: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
	}, {
		timestamps: false
	});
	User.associate = (models) => {
		User.hasMany(models.user_connection);
		User.hasMany(models.user_message);
		User.hasMany(models.user_soundboard);
		User.hasMany(models.user_quote);
	};

	return User;
};