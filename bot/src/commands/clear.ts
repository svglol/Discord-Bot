import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from '../types';
export default {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear bot messages in current chat channel')
		.setDefaultPermission(false),
	async execute(interaction : any) {
		await interaction.deferReply();
		interaction.channel.messages.fetch({limit:20}).then(messages => {
			const messagesToDelete = [];
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
} as BotCommand;