import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../types';
let client;
export default {
	data: new SlashCommandBuilder()
		.setName('quotes')
		.setDescription('Get quotes from @user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to get quotes from')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const user = await client.db.getUser(interaction.options.data[0].value);
		if(user){
			const cUser =  await interaction.client.users.fetch(String(interaction.options.data[0].value));
			const embed = new MessageEmbed()
				.setTitle('Quotes')
				.setAuthor(cUser.username)
				.setColor('#0099ff');
			let description = '';
			user.quotes.forEach(element => {
				description += element.id + ': '+element.quote + ' \n';
			});

			if(user.quotes.length === 0){
				description = 'No quotes found!';
			}
			embed.setDescription(description);
			interaction.editReply({ embeds: [embed], components: [] });
		}
		else{
			interaction.editReply('User not found!');
		}
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	},
} as BotCommand;