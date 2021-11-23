import { SlashCommandBuilder } from '@discordjs/builders';
import { BotClient, BotCommand } from '../types';
let client: BotClient;
export default {
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
	async setClient(client_ : BotClient) {
		client = client_;
	},
	adminOnly: true
} as BotCommand;