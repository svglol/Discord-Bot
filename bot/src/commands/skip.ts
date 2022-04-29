import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
let client;
export default {
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skip currently playing sound command"),
	async execute(interaction) {
		await interaction.deferReply();
		client.soundManager.skip();
		await interaction.deleteReply();
	},
	needsClient: true,
	async setClient(_client) {
		client = _client;
	},
	adminOnly: true,
} as BotCommand;
