module.exports = (sequelize, DataTypes) => {
	const UserSoundboard = sequelize.define('user_soundboard', {
		date: DataTypes.INTEGER,
		command: DataTypes.STRING
	}, {
		timestamps: false
	});

	UserSoundboard.associate = (models) => {
		UserSoundboard.belongsTo(models.user);
	};

	return UserSoundboard;
};