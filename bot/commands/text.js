const { SlashCommandBuilder } = require('@discordjs/builders');
var choices = [];
var client;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('text')
		.setDescription('Show text command to channel')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The text command')
				.setRequired(true)
				.addChoices(choices)),
	async execute(interaction) {
		var command = await client.db.getTextCommand(interaction.options.data[0].value);
		await interaction.reply(command.link);
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
		choices = [];
		var textCommands = await client.db.getTextCommands();
		textCommands.forEach(command => {
			var choice = { name: String(command.command), value: String(command.command) };
			choices.push(choice);
		});
		this.data.options[0].choices = choices;
	}
};

