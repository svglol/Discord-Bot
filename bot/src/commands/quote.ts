import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from '../types';
let client;
export default {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Get specific quote by id')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('Quote ID')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const quote = await client.db.getQuote(interaction.options.data[0].value);
		if(quote){
			interaction.editReply(quote.quote + ' - ' + '<@' + quote.userId + '>');
		}
		else{
			interaction.editReply('Quote not found!');
		}
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	},
} as BotCommand;