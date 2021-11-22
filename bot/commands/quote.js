const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Get specific quote by id')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('Quote ID')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		let quote = await interaction.client.db.getQuote(interaction.options.data[0].value);
		if(quote){
			interaction.editReply(quote.quote + ' - ' + '<@' + quote.userId + '>');
		}
		else{
			interaction.editReply('Quote not found!');
		}
	}
};