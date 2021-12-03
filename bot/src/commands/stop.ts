import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
let client;
export default {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("Stop playing all currently queued sound commands")
		.setDefaultPermission(false),
	async execute(interaction) {
		await interaction.deferReply();
		client.soundManager.stop();
		await interaction.deleteReply();
	},
	needsClient: true,
	async setClient(_client) {
		client = _client;
	},
	adminOnly: true,
} as BotCommand;
