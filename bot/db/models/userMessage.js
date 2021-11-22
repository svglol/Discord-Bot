module.exports = (sequelize, DataTypes) => {
	const UserMessage = sequelize.define('user_message', {
		date: DataTypes.INTEGER
	}, {
		timestamps: false
	});

	UserMessage.associate = (models) => {
		UserMessage.belongsTo(models.user);
	};

	return UserMessage;
};