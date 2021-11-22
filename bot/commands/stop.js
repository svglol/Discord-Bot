const { SlashCommandBuilder } = require('@discordjs/builders');
var client;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing all currently queued sound commands')
		.setDefaultPermission(false),
	async execute(interaction) {
		await interaction.deferReply();
		client.soundManager.stop();
		await interaction.deleteReply();
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	},
	adminOnly: true
};

