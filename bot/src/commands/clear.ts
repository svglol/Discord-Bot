import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
export default {
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear bot messages in current chat channel"),
	async execute(interaction) {
		await interaction.deferReply();
		interaction.channel.messages.fetch({ limit: 20 }).then(async (messages) => {
			const messagesToDelete = [];
			messages.forEach((chatMessage) => {
				if (chatMessage.author.bot) {
					messagesToDelete.push(chatMessage);
				}
			});

			const channel = await interaction.guild.channels.cache.get(
				interaction.channelId
			);
			if (channel.isText()) {
				channel.bulkDelete(messagesToDelete);
			}
		});
		await interaction.deleteReply();
	},
} as BotCommand;
