import { BotClient, BotDeployCommands } from '../types';
import * as dotenv from 'dotenv';
dotenv.config();
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
const clientId = process.env.CLIENTID;
const token = process.env.TOKEN;
import {ApplicationCommandPermissionData} from 'discord.js';
import { Permissions } from 'discord.js';
export class DeployCommands implements BotDeployCommands{

	client: BotClient;
	constructor(client_) {
		this.client = client_;
	}
	async deploy(): Promise<void>{
		const commands = [];

		this.client.commands.forEach(element => {
			commands.push(element.data.toJSON());
		});
		const rest = new REST({ version: '9' }).setToken(token);
		
		const guilds = await this.client.guilds.fetch();

		guilds.forEach(guild => {
			rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commands })
				.then(async () => {
					console.log('Successfully registered application commands.');

					const commands = await this.client.guilds.cache.get(guild.id)?.commands.fetch();
					const members = await this.client.guilds.cache.get(guild.id)?.members.fetch();
					commands.forEach(command => {
						this.client.commands.forEach(baseCommand => {
							if(command.name === baseCommand.data.name){
								if(baseCommand.adminOnly){
									members.forEach(async (member) => {
										if(member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
											const permissions : ApplicationCommandPermissionData[] = [{
												id: member.id,
												type: 'USER',
												permission: true
											}];
											await command.permissions.add({permissions});
										}
									});
								}
							}
						});
					});
					console.log('Successfully set commands permissions');
				})
				.catch(console.error);
		});

	}
}