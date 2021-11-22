require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.CLIENTID;
const token = process.env.TOKEN;

var commands = [];

module.exports = {
	async register(client) {
		commands = [];

		client.commands.forEach(element => {
			commands.push(element.data.toJSON());
		});
		const rest = new REST({ version: '9' }).setToken(token);
		
		const guilds = await client.guilds.fetch();

		guilds.forEach(guild => {
			rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commands })
				.then(async () => {
					console.log('Successfully registered application commands.');

					let adminUsers = await client.db.getUsers();
					adminUsers = adminUsers.filter(user => (user.adminPermission));

					const commands = await client.guilds.cache.get(guild.id)?.commands.fetch();
					commands.forEach(command => {
						client.commands.forEach(baseCommand => {
							if(command.name === baseCommand.data.name){
								if(baseCommand.adminOnly){
									adminUsers.forEach(async (admin) => {
										const permissions = [
											{
												id: admin.id,
												type: 'USER',
												permission: true,
											},
										];
										await command.permissions.add({ permissions });
									});
								}
							}
						});
					});
					console.log('Successfully set commands permissions');
				})
				.catch(console.error);
		});

	},
};