import * as dotenv from "dotenv";
import Discord = require("discord.js");
import { Collection, Intents } from "discord.js";
import Keyv = require("keyv");

import express = require("express");
import { ApolloServer, gql } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import typeDefs = require("./graphql/schema");
import resolvers = require("./graphql/resolvers");
import { Db } from "./db";
import { SoundManager } from "./lib/soundManager";
import { DeployCommands } from "./lib/deployCommands";
import { Update } from "./lib/update";
import {
	BotClient,
	BotCommand,
	BotEvent,
	BotSoundManager,
	Database,
} from "./types";
import * as events from "./events";
import * as commands from "./commands";
dotenv.config();

// Create a new client instance
class Client extends Discord.Client implements BotClient {
	public db: Database;
	public deployCommands: DeployCommands;
	public startTime: number;
	public keyv: Keyv;
	soundManager: BotSoundManager;
	commands: Discord.Collection<string, BotCommand>;

	/**
	 * Creates an instance of client.
	 * @param options
	 */
	constructor(options: Discord.ClientOptions) {
		super(options);
		this.db = new Db();
		this.commands = new Collection();
		this.startTime = new Date().getTime();
		this.keyv = new Keyv("sqlite://../resources/database.sqlite");
		this.soundManager = new SoundManager(this);
		this.deployCommands = new DeployCommands(this);

		this.once("ready", () => {
			const db = this.db;

			const server = new ApolloServer({
				typeDefs: gql(typeDefs),
				resolvers,
				context: { db, client, update: new Update() },
				uploads: false,
				introspection: true,
				playground: true,
			});

			const app = express();
			app.use(graphqlUploadExpress());
			server.applyMiddleware({ app });
			this.db.sequelize.sync().then(() => {
				console.log("Database Initialized");
				app.listen({ port: 4000 }, () => {
					console.log(
						`🚀 Server ready at http://localhost:4000${server.graphqlPath}`
					);
				});
				this.loadCommands();
			});
		});

		// Load events
		Object.values(events).forEach((event: BotEvent) => {
			if (event.once) {
				this.once(event.name, (...args) => event.execute(...args));
			} else {
				this.on(event.name, (...args) => event.execute(...args));
			}
		});
	}

	/**
	 * Loads commands
	 * @returns commands
	 */
	public async loadCommands(): Promise<void> {
		client.commands = new Collection();
		await Object.values(commands).forEach(async (command: BotCommand) => {
			if (command.needsClient) {
				await command.setClient(client);
			}
			client.commands.set(command.data.name, command);
		});
		this.deployCommands.deploy();
	}
}

const client: BotClient = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_PRESENCES,
	],
});

client.login(process.env.TOKEN);
