module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_connection', {
		user_id: DataTypes.STRING,
		connectTime: DataTypes.INTEGER,
    disconnectTime: DataTypes.INTEGER,
		connectionLength: DataTypes.INTEGER
	}, {
		timestamps: false,
	});
};
