import fs = require("fs");
import { GraphQLUpload } from "graphql-upload";
import { finished } from "stream/promises";
export = {
	Upload: GraphQLUpload,

	User: {
		connections: (parent) => parent.connections,
		messages: (parent) => parent.messages,
		soundboards: (parent) => parent.soundboards,
		quotes: (parent) => parent.quotes,
		totalQuotes: (parent) => {
			const quotes = parent.quotes;
			return quotes.length;
		},
		totalMessages: (parent) => {
			const messages = parent.messages;
			return messages.length;
		},
		totalSoundboards: (parent) => {
			const soundboards = parent.soundboards;
			return soundboards.length;
		},
		totalConnectionLength: (parent) => {
			const connections = parent.connections;
			let total = 0;
			connections.forEach((connection) => {
				total += connection.connectionLength;
			});
			return total;
		},
	},

	Query: {
		user: (parent, { id }, { db }) => db.getUser(id),
		users: (parent, args, { db }) => db.getUsers(),
		soundCommand: (parent, { id }, { db }) =>
			db.sequelize.models.SoundCommand.findByPk(id),
		soundCommands: (parent, args, { db }) =>
			db.sequelize.models.SoundCommand.findAll(),
		textCommands: (parent, args, { db }) =>
			db.sequelize.models.TextCommand.findAll(),
		textCommand: (parent, { id }, { db }) =>
			db.sequelize.models.TextCommand.findByPk(id),
		userMessages: (parent, args, { db }) =>
			db.sequelize.models.Message.findAll(),
		userConnections: (parent, args, { db }) =>
			db.sequelize.models.Connection.findAll(),
		userSoundboards: (parent, args, { db }) =>
			db.sequelize.models.Soundboard.findAll(),
		bot: (parent, args, { client }) => {
			let totalUsers = 0;
			let onlineUsers = 0;
			let connectedUsers = 0;
			client.guilds.cache.forEach((guild) => {
				totalUsers += guild.memberCount;
				onlineUsers += guild.members.cache.filter(
					(m) => m.presence?.status != "offline"
				).size;
				connectedUsers += guild.members.cache.filter(
					(m) => m.voice.channel !== null
				).size;
			});
			const bot = {
				uptime: client.startTime,
				totalUsers: totalUsers,
				onlineUsers: onlineUsers,
				connectedUsers: connectedUsers,
			};
			return bot;
		},
		servers: (parent, args, { client }) => {
			return client.guilds.cache;
		},
		voiceChannels: (parent, { id }, { client }) => {
			const guild = client.guilds.cache.get(id);
			return guild.channels.cache.filter((c) => c.type === "GUILD_VOICE");
		},
		textChannels: (parent, { id }, { client }) => {
			const guild = client.guilds.cache.get(id);
			return guild.channels.cache.filter((c) => c.type === "GUILD_TEXT");
		},
		soundCommandFileExists: (parent, { id }, { db }) => {
			return db.sequelize.models.SoundCommand.findByPk(id).then((result) => {
				if (fs.existsSync(result.file)) {
					return true;
				}
				return false;
			});
		},
		soundCommandFile: (parent, { id }, { db }) => {
			return db.sequelize.models.SoundCommand.findByPk(id).then((result) => {
				const file = result.file;
				const data = fs.readFileSync(file);
				return data.toString("base64");
			});
		},
		quotes: (parent, args, { db }) => db.sequelize.models.Quote.findAll(),
		quote: (parent, { id }, { db }) => {
			db.sequelize.models.Quote.findByPk(id);
		},
	},
	Mutation: {
		skipSound: (parent, args, { client }) => {
			client.soundManager.skip();
			return "skipped";
		},
		stopSound: (parent, args, { client }) => {
			client.soundManager.stop();
			return "stopped";
		},
		clear: (parent, { channel }, { client }) => {
			const chan = client.channels.cache.get(channel);
			chan.messages.fetch(5).then((messages) => {
				const messagesToDelete = [];
				messages.forEach((chatMessage) => {
					if (chatMessage.content.charAt(0) === client.prefix) {
						messagesToDelete.push(chatMessage);
					}
					if (chatMessage.author.bot) {
						messagesToDelete.push(chatMessage);
					}
				});
				chan.bulkDelete(messagesToDelete);
			});
			return "cleared";
		},
		reset: (parent, args, { client }) => {
			client.soundManager.stop();
			process.exit(1);
		},
		message: (parent, { channel, message }, { client }) => {
			const chan = client.channels.cache.get(channel);
			chan.send(message);
			return "message sent";
		},
		play: (parent, { command, channel, server }, { client }) => {
			command = command.replace(/['"]+/g, "");
			client.soundManager.queue(
				null,
				command,
				null,
				client.channels.cache.get(channel).id,
				server
			);
			return "sound queued";
		},
		updateUser: (parent, { id, intro, exit, adminPermission }, { db }) => {
			return db.sequelize.models.Users.update(
				{
					intro: intro,
					exit: exit,
					adminPermission: adminPermission,
				},
				{
					where: {
						id: id,
					},
				}
			);
		},
		deleteTextCommand: (parent, { id }, { db, client }) => {
			return db.sequelize.models.TextCommand.destroy({
				where: {
					id: id,
				},
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		updateTextCommand: (parent, { id, command, link }, { db, client }) => {
			return db.sequelize.models.TextCommand.update(
				{
					command: command,
					link: link,
				},
				{
					where: {
						id: id,
					},
				}
			).then(() => {
				client.loadCommands();
				return db.sequelize.models.TextCommand.findByPk(id);
			});
		},
		addTextCommand: (parent, { command, link, date }, { db, client }) => {
			return db.sequelize.models.TextCommand.create({
				command: command,
				link: link,
				date: date,
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		deleteSoundCommand: async (parent, { id }, { db, client }) => {
			await db.sequelize.models.SoundCommand.findByPk(id).then((result) => {
				try {
					fs.unlinkSync(result.file);
				} catch (error) {
					console.log(error);
				}
			});
			return db.sequelize.models.SoundCommand.destroy({
				where: {
					id: id,
				},
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		addSoundCommand: async (
			parent,
			{ command, file, volume, date },
			{ db, client }
		) => {
			const path = "../resources/sound/" + command + ".wav";
			const { createReadStream } = await file;
			const stream = createReadStream();
			const out = fs.createWriteStream(path);
			stream.pipe(out);
			await finished(out);
			return db.sequelize.models.SoundCommand.create({
				command: command,
				file: path,
				volume: volume,
				date: date,
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		updateSoundCommand: async (
			parent,
			{ id, command, file, volume },
			{ db, client }
		) => {
			// let oldCommand = await db.sound_commands.findByPk(id);
			// let path = './resources/sound/' + command + '.wav';
			// if (String(oldCommand.command) !== String(command)) {
			// 	fs.copyFileSync(oldCommand.file, path);
			// 	fs.unlinkSync(oldCommand.file);
			// }
			// if (file !== null || file !== undefined) {
			// 	const { createReadStream } = await file;
			// 	const stream = createReadStream();
			// 	const out = require('fs').createWriteStream(path);
			// 	stream.pipe(out);
			// 	await finished(out);
			// }
			return db.sequelize.models.SoundCommand.update(
				{
					command: command,
					// file: path,
					volume: volume,
				},
				{
					where: {
						id: id,
					},
				}
			).then(() => {
				client.loadCommands();
				return db.sequelize.models.SoundCommand.findByPk(id);
			});
		},
		deleteQuote: (parent, { id }, { db }) => {
			return db.sequelize.models.Quotes.destroy({
				where: {
					id: id,
				},
			}).then((result) => {
				return result;
			});
		},
	},
};
