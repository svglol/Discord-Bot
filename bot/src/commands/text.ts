import { SlashCommandBuilder } from '@discordjs/builders';
import { BotClient, BotCommand } from '../types';
let choices = [];
let client : BotClient;

export default {
	data: new SlashCommandBuilder()
		.setName('text')
		.setDescription('Show text command to channel')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The text command')
				.setRequired(true)
				.addChoices(choices)),
	async execute(interaction) {
		const command = await client.db.getTextCommand(interaction.options.data[0].value);
		await interaction.reply(command.link);
	},
	needsClient: true,
	async setClient(client_ : BotClient) {
		client = client_;
		choices = [];
		const textCommands = await client.db.getTextCommands();
		textCommands.forEach(command => {
			const choice = { name: String(command.command), value: String(command.command) };
			choices.push(choice);
		});
		this.data.options[0].choices = choices;
	}
} as BotCommand;

