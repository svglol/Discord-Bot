import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { BotClient, BotCommand } from '../types';
let client : BotClient;
export default{
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip currently playing sound command')
		.setDefaultPermission(false),
	async execute(interaction : CommandInteraction) {
		await interaction.deferReply();
		client.soundManager.skip();
		await interaction.deleteReply();
	},
	needsClient: true,
	async setClient(client_ : BotClient) {
		client = client_;
	},
	adminOnly: true
} as BotCommand;