import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from '../types';
const choices = [];
let client;

export default {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play sound from commands, or from youtube to current voice channel')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('Sound command or youtube link')
				.setRequired(true)
				.addChoices(choices)),
	async execute(interaction) {
		const command = interaction.options.getString('command');
		if (validateYouTubeUrl(command)) {
			await interaction.reply('Queuing Youtube - ' + command);
			client.soundManager.queue(interaction,null, command);
		}
		else {
			await interaction.reply('Queuing Command - ' + command);
			client.soundManager.queue(interaction, command);
		}
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	}
} as BotCommand;

function validateYouTubeUrl(url) {
	if (url != undefined || url != '') {
		const regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
		if (url.match(regExp)) {
			return true;
		}
		else {
			return false;
		}
	}
}
