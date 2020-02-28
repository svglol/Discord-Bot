module.exports = (sequelize, DataTypes) => {
	return sequelize.define('command_volume', {
		command: DataTypes.INTEGER,
    volume: DataTypes.INTEGER,
	}, {
		timestamps: false,
	});
};
