import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { BotClient, BotCommand } from '../types';

let generalEmbed;
let soundEmbed;
let textEmbed;
let client;
let currentEmbed;

export default{
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Help'),
	async execute(interaction ) {
		await interaction.deferReply();
		await generateGeneralEmbed();
		await generateSoundEmbed();
		await generateTextEmbed();

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('general')
					.setLabel('Commands')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('sound')
					.setLabel('Sound Options')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('text')
					.setLabel('Text Options')
					.setStyle('SECONDARY')
			);

		const filter = i => (i.customId === 'general' || 'sound' || 'text') && i.user.id === interaction.user.id;

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async i => {
			if (i.customId === 'general') {
				currentEmbed = generalEmbed;
			}
			else if (i.customId === 'sound') {
				currentEmbed = soundEmbed;
			}
			else if (i.customId === 'text') {
				currentEmbed = textEmbed;
			}
			await i.update({ embeds: [currentEmbed], components: [row] });
		});

		collector.on('end', () => {
			interaction.editReply({ embeds: [currentEmbed], components: [] });
		});

		await interaction.editReply({ embeds: [generalEmbed], components: [row] });
	},
	needsClient: true,
	async setClient(client_ : BotClient) {
		client = client_;
	},
} as BotCommand;

async function generateTextEmbed() {
	textEmbed = new MessageEmbed()
		.setTitle(':frame_photo: Text Options')
		.setColor('#0099ff');

	const textCommands = await client.db.getTextCommands();
	textCommands.sort(function (a, b) {
		if (a.command < b.command) {
			return -1;
		}
		if (a.command > b.command) {
			return 1;
		}
		return 0;
	});
	let i = 0;
	const messages = [];
	textCommands.forEach(command => {
		const addMessage = '`' + command.command + '` ';
		if (messages[i] !== undefined) {
			if (messages[i].length + addMessage.length < 1024) {
				messages[i] += addMessage;
			}
			else {
				i++;
				messages[i] = '';
				messages[i] += addMessage;
			}
		}
		else {
			messages[i] = '';
			messages[i] += addMessage;
		}
	});
	messages.forEach((message, index) => {
		if (index === 0) {
			textEmbed.addField('/command `command:`', message);
		}
		else {
			textEmbed.addField('...', message);
		}
	});
}

async function generateSoundEmbed() {
	soundEmbed = new MessageEmbed()
		.setTitle(':loud_sound: Sound Options')
		.setColor('#0099ff');

	const soundCommands = await client.db.getSoundCommands();
	soundCommands.sort(function (a, b) {
		if (a.command < b.command) {
			return -1;
		}
		if (a.command > b.command) {
			return 1;
		}
		return 0;
	});
	let i = 0;
	const messages = [];
	soundCommands.forEach(command => {
		const addMessage = '`' + command.command + '` ';
		if (messages[i] !== undefined) {
			if (messages[i].length + addMessage.length < 1024) {
				messages[i] += addMessage;
			}
			else {
				i++;
				messages[i] = '';
				messages[i] += addMessage;
			}
		}
		else {
			messages[i] = '';
			messages[i] += addMessage;
		}
	});
	messages.forEach((message, index) => {
		if (index === 0) {
			soundEmbed.addField('/sound `sound:`', message);
		}
		else {
			soundEmbed.addField('...', message);
		}
	});
}

function generateGeneralEmbed() {
	generalEmbed = new MessageEmbed()
		.setTitle(':keyboard: Commands')
		.setColor('#0099ff');

	let title = '';
	client.commands.forEach(command => {
		if(!command.adminOnly){
			title = '/' + command.data.name;
			command.data.options.forEach(option => {
				if (option.options == undefined) {
					title += ' `' + option.name + ':`';
				}
				else {
					title += ' `' + option.name + '`';
				}
			});
			generalEmbed.addField(title, command.data.description);
		}
	});

	currentEmbed = generalEmbed;
}

