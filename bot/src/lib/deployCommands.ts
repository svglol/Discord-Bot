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
				})
				.catch(console.error);
		});
	}
}
