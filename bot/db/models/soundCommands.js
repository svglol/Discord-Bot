module.exports = (sequelize, DataTypes) => {
	const SoundCommands = sequelize.define('sound_commands', {
		command: DataTypes.INTEGER,
		file: DataTypes.STRING,
		volume: {
			type: DataTypes.INTEGER,
			defaultValue: 1
		},
		date: DataTypes.INTEGER
	}, {
		timestamps: false
	});
	return SoundCommands;
};