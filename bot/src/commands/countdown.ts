import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
let client;

export default {
	data: new SlashCommandBuilder()
		.setName("321")
		.setDescription(
			"Play countdown sound from commands to current voice channel"
		),
	async execute(interaction) {
		const command = "321";
		await interaction.reply("Queuing Command - " + command);
		client.soundManager.queue(interaction, command);
	},
	needsClient: true,
	async setClient(_client) {
		client = _client;
	},
} as BotCommand;
