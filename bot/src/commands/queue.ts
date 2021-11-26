import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../types';
let client;

export default {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show the current sound queue'),
	async execute(interaction) {
		await interaction.deferReply();
		const resources = client.soundManager.resources;
		const embed = new MessageEmbed()
			.setTitle('Sound Queue')
			.setColor('#0099ff');
		if (resources.length === 0) {
			embed.addField('Nothing currently queued', '-');
		}
		resources.forEach(async (resource, i) => {
			if (i < 25) {
				if (resource.commandName !== undefined) {
					if (i === 0) {
						embed.addField('Currently Playing', resource.commandName);
					}
					else {
						embed.addField(String(i), resource.commandName);
					}
				}
				else if (resource.title !== undefined) {
					if (i === 0) {
						embed.addField('Currently Playing', resource.title);
					}
					else {
						embed.addField(String(i), resource.title);
					}
				}
			}
		});

		interaction.editReply({ embeds: [embed], components: [] });
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	}
} as BotCommand;