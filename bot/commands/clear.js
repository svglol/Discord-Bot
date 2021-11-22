const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear bot messages in current chat channel')
		.setDefaultPermission(false),
	async execute(interaction) {
		await interaction.deferReply();
		interaction.channel.messages.fetch(20).then(messages => {
			var messagesToDelete = [];
			messages.forEach(chatMessage => {
				if (chatMessage.author.bot) {
					messagesToDelete.push(chatMessage);
				}
			});
			interaction.channel.bulkDelete(messagesToDelete);
		});
		await interaction.deleteReply();
	},
	adminOnly: true
};