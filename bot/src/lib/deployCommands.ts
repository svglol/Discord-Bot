import { BotClient, BotCommand, BotDeployCommands } from "../types";
import * as dotenv from "dotenv";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { ApplicationCommandPermissionData, Permissions } from "discord.js";
dotenv.config();
const clientId = process.env.CLIENTID;
const token = process.env.TOKEN;
export class DeployCommands implements BotDeployCommands {
	client: BotClient;

	/**
	 * Creates an instance of deploy commands.
	 * @param client
	 */
	constructor(client) {
		this.client = client;
	}

	/**
	 * Deploys commands
	 * @returns deploy
	 */
	async deploy(): Promise<void> {
		const commands = [];

		this.client.commands.forEach((command: BotCommand) => {
			commands.push(command.data.toJSON());
		});
		const rest = new REST({ version: "9" }).setToken(token);

		const guilds = await this.client.guilds.fetch();

		guilds.forEach((guild) => {
			rest
				.put(Routes.applicationGuildCommands(clientId, guild.id), {
					body: commands,
				})
				.then(async () => {
					console.log("Successfully registered application commands.");

					const commands = await this.client.guilds.cache
						.get(guild.id)
						?.commands.fetch();
					const members = await this.client.guilds.cache
						.get(guild.id)
						?.members.fetch();
					commands.forEach((command) => {
						this.client.commands.forEach(async (baseCommand: BotCommand) => {
							if (command.name === baseCommand.data.name) {
								if (baseCommand.adminOnly) {
									const permissions: ApplicationCommandPermissionData[] = [];
									members.forEach(async (member) => {
										if (
											member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
										) {
											await permissions.push({
												id: member.id,
												type: "USER",
												permission: true,
											});
										}
									});
									await command.permissions.add({ permissions });
								}
							}
						});
					});
					console.log("Successfully set commands permissions");
				})
				.catch(console.error);
		});
	}
}
