module.exports = (sequelize, DataTypes) => {
	const TextCommands = sequelize.define('text_commands', {
		command: DataTypes.STRING,
		link: DataTypes.STRING,
		date: DataTypes.INTEGER
	}, {
		timestamps: false
	});
	return TextCommands;
};