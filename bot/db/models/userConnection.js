module.exports = (sequelize, DataTypes) => {
	const UserConnection = sequelize.define('user_connection', {
		connectTime: DataTypes.INTEGER,
		disconnectTime: DataTypes.INTEGER,
		connectionLength: DataTypes.INTEGER
	}, {
		timestamps: false
	});

	UserConnection.associate = (models) => {
		UserConnection.belongsTo(models.user);
	};

	return UserConnection;
};