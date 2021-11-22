const { SlashCommandBuilder } = require('@discordjs/builders');
var choices = [];
var client;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play sound from commands, or from youtube to current voice channel')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('Sound command or youtube link')
				.setRequired(true)
				.addChoices(choices)),
	async execute(interaction) {
		if (validateYouTubeUrl(interaction.options.data[0].value)) {
			await interaction.reply('Queuing Youtube - ' + interaction.options.data[0].value);
			client.soundManager.queueYt(interaction, interaction.options.data[0].value);
		}
		else {
			await interaction.reply('Queuing Command - ' + interaction.options.data[0].value);
			client.soundManager.queue(interaction, interaction.options.data[0].value);
		}
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
		// choices = [];
		// let soundCommands = await client.db.getTopSoundCommands();
		// soundCommands.forEach(command => {
		//     let choice = { name: String(command.command), value: String(command.command) }
		//     choices.push(choice);
		// });
		// this.data.options[0].choices = choices;
	}
};

function validateYouTubeUrl(url) {
	if (url != undefined || url != '') {
		var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
		if (url.match(regExp)) {
			return true;
		}
		else {
			return false;
		}
	}
}
