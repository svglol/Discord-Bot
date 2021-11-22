require('dotenv').config();
const fs = require('fs');
const deployCommands = require('./lib/deployCommands.js');
const Discord = require('discord.js');
const { Collection, Intents } = require('discord.js');
const Keyv = require('keyv');

const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const {graphqlUploadExpress } = require('graphql-upload');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const db = require('./db');
const keyv = new Keyv('sqlite://../resources/database.sqlite');

// Create a new client instance
class Client extends Discord.Client {
	constructor(...args) {
		super(...args);
		this.db = db;
		this.deployCommands = deployCommands;
		this.commands = new Collection();
		this.startTime = new Date().getTime();
		this.keyv = keyv;

		this.once('ready',() => {
			const playground = {
				settings: {
					'editor.cursorShape': 'line'
				}
			};
	
			const server = new ApolloServer({
				typeDefs: gql(typeDefs),
				resolvers,
				context: { db, client },
				playground,
				uploads: false
			});
	
			const app = express();
			app.use(graphqlUploadExpress());
			server.applyMiddleware({ app });
			db.sequelize.sync().then(() => {
				console.log('Database Initialized');
				app.listen({ port: 4000 }, () => {
					console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
				}
				);
				this.loadCommands();
			});
		});
	}
	async loadCommands(){
		client.commands = new Collection();
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);
			if (command.needsClient) {
				await command.setClient(client);
			}
			client.commands.set(command.data.name, command);
		}
		this.registerCommands();
	}

	registerCommands() {
		deployCommands.register(this);
	}
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] });


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// Login to Discord with your client's token
client.login(process.env.TOKEN);