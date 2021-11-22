const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset the bot')
		.setDefaultPermission(false),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		console.log('Reseting the bot');
		process.exit(0);
	},
	adminOnly: true
};