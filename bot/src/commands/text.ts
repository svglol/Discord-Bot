import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
let client;
export default {
	data: new SlashCommandBuilder()
		.setName("text")
		.setDescription("Show text command to channel")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("The text command")
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply();
		const command = await client.db.getTextCommand(
			interaction.options.getString("command")
		);
		if (command == undefined) {
			// no command found
			await interaction.editReply(
				`Text command not found ${interaction.options.getString("command")}`
			);
		}
		await interaction.editReply(command.link);
	},
	needsClient: true,
	async setClient(_client) {
		client = _client;
	},
} as BotCommand;
