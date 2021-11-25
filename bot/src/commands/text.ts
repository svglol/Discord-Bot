import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from '../types';
let client;
export default {
	data: new SlashCommandBuilder()
		.setName('text')
		.setDescription('Show text command to channel')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The text command')
				.setRequired(true)),
	async execute(interaction) {
		const command = await client.db.getTextCommand(String(interaction.options.data[0].value));
		await interaction.reply(command.link);
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	}
} as BotCommand;

