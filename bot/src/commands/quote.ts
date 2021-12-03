import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
let client;
export default {
	data: new SlashCommandBuilder()
		.setName("quote")
		.setDescription("Get specific quote by id")
		.addIntegerOption((option) =>
			option.setName("id").setDescription("Quote ID").setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply();
		const quote = await client.db.getQuote(
			interaction.options.getInteger("id")
		);
		if (quote) {
			interaction.editReply(quote.quote + " - " + "<@" + quote.userId + ">");
		} else {
			interaction.editReply("Quote not found!");
		}
	},
	needsClient: true,
	async setClient(_client) {
		client = _client;
	},
} as BotCommand;
