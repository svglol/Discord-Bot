const fs = require('fs');
const { GraphQLUpload } = require('graphql-upload');
const { finished } = require('stream/promises');
module.exports = {
	Upload: GraphQLUpload,

	User: {
		connections: (parent) => parent.user_connections,
		messages: (parent) => parent.user_messages,
		soundboards: (parent) => parent.user_soundboards,
		totalMessages: (parent) => { let messages = parent.user_messages; return messages.length; },
		totalSoundboards: (parent) => { let soundboards = parent.user_soundboards; return soundboards.length; },
		totalConnectionLength: (parent) => {
			let connections = parent.user_connections;
			let total = 0;
			connections.forEach(connection => {
				total += connection.connectionLength;
			});
			return total;
		},
	},

	Query: {
		user: (parent, { id }, { db }) => db.user.findByPk(id, {
			include: [
				{
					model: db.user_message,
					as: 'user_messages',
					separate: true,
				},
				{
					model: db.user_connection,
					as: 'user_connections',
					separate: true,
				},
				{
					model: db.user_soundboard,
					as: 'user_soundboards',
					separate: true,
				},]
		}),
		users: (parent, args, { db }) => db.user.findAll({
			include: [
				{
					model: db.user_message,
					as: 'user_messages',
					separate: true,
				},
				{
					model: db.user_connection,
					as: 'user_connections',
					separate: true,
				},
				{
					model: db.user_soundboard,
					as: 'user_soundboards',
					separate: true,
				},]
		}),
		soundCommand: (parent, { id }, { db }) => db.sound_commands.findByPk(id),
		soundCommands: (parent, args, { db }) => db.sound_commands.findAll(),
		textCommands: (parent, args, { db }) => db.text_commands.findAll(),
		textCommand: (parent, { id }, { db }) => db.text_commands.findByPk(id),
		userMessages: (parent, args, { db }) => db.user_message.findAll(),
		userConnections: (parent, args, { db }) => db.user_connection.findAll(),
		userSoundboards: (parent, args, { db }) => db.user_soundboard.findAll(),
		bot: (parent, args, { client }) => {
			let totalUsers = 0;
			let onlineUsers = 0;
			let connectedUsers = 0;
			client.guilds.cache.forEach((guild) => {
				totalUsers += guild.memberCount;
				onlineUsers += guild.members.cache.filter(m => m.presence.status === 'online').size;
				connectedUsers += guild.members.cache.filter(m => m.voice.channel !== null).size;
			});
			let bot = { uptime: client.startTime, totalUsers: totalUsers, onlineUsers: onlineUsers, connectedUsers: connectedUsers };
			return bot;
		},
		servers: (parent, args, { client }) => { return client.guilds.cache; },
		voiceChannels: (parent, { id }, { client }) => {
			let guild = client.guilds.cache.get(id);
			return guild.channels.cache.filter(c => c.type === 'GUILD_VOICE');
		},
		textChannels: (parent, { id }, { client }) => {
			let guild = client.guilds.cache.get(id);
			return guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');
		},
		soundCommandFileExists: (parent, { id }, { db }) => {
			return db.sound_commands.findByPk(id).then((result) => {
				if (fs.existsSync(result.file)) {
					return true;
				}
				return false;
			});
		},
		soundCommandFile: (parent, { id }, { db }) => {
			return db.sound_commands.findByPk(id).then((result) => {
				var file = result.file;
				var data = fs.readFileSync(file);
				return data.toString('base64');
			});
		},
	},
	Mutation: {
		skipSound: (parent, args, { client }) => {
			client.soundManager.skip();
			return 'skipped';
		},
		stopSound: (parent, args, { client }) => {
			client.soundManager.stop();
			return 'stopped';
		},
		clear: (parent, { channel }, { client }) => {
			let chan = client.channels.cache.get(channel);
			chan.messages.fetch(5).then(messages => {
				let messagesToDelete = [];
				messages.forEach(chatMessage => {
					if (chatMessage.content.charAt(0) === client.prefix) {
						messagesToDelete.push(chatMessage);
					}
					if (chatMessage.author.bot) {
						messagesToDelete.push(chatMessage);
					}
				});
				chan.bulkDelete(messagesToDelete);
			});
			return 'cleared';
		},
		reset: (parent, args, { client }) => {
			client.soundManager.stop();
			process.exit(1);
		},
		message: (parent, { channel, message }, { client }) => {
			let chan = client.channels.cache.get(channel);
			chan.send(message);
			return 'message sent';
		},
		play: (parent, { command, channel, server }, { client }) => {
			command = command.replace(/['"]+/g, '');
			client.soundManager.queueApi(command, client.channels.cache.get(channel).id, server);
			return 'sound queued';
		},
		updateUser: (parent, { id, intro, exit, adminPermission }, { db }) => {
			return db.user.update(
				{
					intro: intro,
					exit: exit,
					adminPermission: adminPermission
				},
				{
					where: {
						id: id
					}
				}
			);
		},
		deleteTextCommand: (parent, { id }, { db, client }) => {
			return db.text_commands.destroy({
				where: {
					id: id
				}
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		updateTextCommand: (parent, { id, command, link }, { db, client }) => {
			return db.text_commands.update(
				{
					command: command,
					link: link
				},
				{
					where: {
						id: id
					}
				}
			).then(() => {
				client.loadCommands();
				return db.text_commands.findByPk(id);
			});
		},
		addTextCommand: (parent, { command, link, date }, { db, client }) => {
			return db.text_commands.create({
				command: command,
				link: link,
				date: date
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		deleteSoundCommand: async (parent, { id }, { db, client }) => {
			await db.sound_commands.findByPk(id).then(result => {
				try {
					fs.unlinkSync(result.file);
				}
				catch (error) {
					console.log(error);
				}
			});
			return db.sound_commands.destroy({
				where: {
					id: id
				}
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		addSoundCommand: async (parent, { command, file, volume, date }, { db, client }) => {
			let path = '../resources/sound/' + command + '.wav';
			const { createReadStream } = await file;
			const stream = createReadStream();
			const out = require('fs').createWriteStream(path);
			stream.pipe(out);
			await finished(out);
			return db.sound_commands.create({
				command: command,
				file: path,
				volume: volume,
				date: date
			}).then((result) => {
				client.loadCommands();
				return result;
			});
		},
		updateSoundCommand: async (parent, { id, command, file, volume }, { db, client }) => {
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
			return db.sound_commands.update(
				{
					command: command,
					// file: path,
					volume: volume
				},
				{
					where: {
						id: id
					}
				}
			).then(() => {
				client.loadCommands();
				return db.sound_commands.findByPk(id);
			});

		},
	}
};