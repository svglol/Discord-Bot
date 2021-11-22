const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('quotes')
		.setDescription('Get quotes from @user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to get quotes from')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		let user = await interaction.client.db.getUser(interaction.options.data[0].value);
		if(user){
			let cUser =  await interaction.client.users.fetch(interaction.options.data[0].value);
			let embed = new MessageEmbed()
				.setTitle('Quotes')
				.setAuthor(cUser.username)
				.setColor('#0099ff');
			let description = '';
			user.user_quotes.forEach(element => {
				description += element.id + ': '+element.quote + ' \n';
			});

			if(user.user_quotes.length === 0){
				description = 'No quotes found!';
			}
			embed.setDescription(description);
			interaction.editReply({ embeds: [embed], components: [] });
		}
		else{
			interaction.editReply('User not found!');
		}
	}
};