module.exports = (sequelize, DataTypes) => {
	const UserQuote = sequelize.define('user_quote', {
		date: DataTypes.INTEGER,
		quote: DataTypes.STRING,
		messageId: DataTypes.STRING
	}, {
		timestamps: false
	});

	UserQuote.associate = (models) => {
		UserQuote.belongsTo(models.user);
	};

	return UserQuote;
};