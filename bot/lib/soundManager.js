var client;
const { createReadStream } = require('fs');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const player = createAudioPlayer();
var connection;
var resources = [];

class SoundManager {
	constructor(discordClient) {
		client = discordClient;

		player.on('error', error => {
			console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			if (resources.length === 0) {
				if (connection !== undefined) {
					connection.destroy();
					connection = undefined;
				}
			}
			else {
				this.play();
			}
		});

		player.on(AudioPlayerStatus.Idle, () => {
			if (resources.length === 0) {
				if (connection !== undefined) {
					connection.destroy();
					connection = undefined;
				}
			}
			else {
				this.play();
			}
		});
	}

	getResources() {
		return resources;
	}

	async queue(interaction, commandName) {
		//getting user voice channel
		let userId = interaction.user.id;
		let guildId = interaction.guildId;

		let voiceChannel;

		const guild = await client.guilds.cache.get(guildId);

		guild.channels.cache.forEach(channel => {
			if (channel.type === 'GUILD_VOICE') {
				channel.members.forEach(member => {
					if (member.id === userId) {
						voiceChannel = channel;
					}
				});
			}
		});

		//not in a voice channel
		if (voiceChannel === undefined) {
			await interaction.editReply('Must be in a voice channel for this command');
			return;
		}

		//getting sound command
		let soundCommand = await client.db.getSoundCommand(commandName);
		if (soundCommand === undefined || soundCommand === null) {
			//no command found
			await interaction.editReply('Sound command not found "' + commandName + '"');
			return;
		}


		let resource = { interaction, voiceChannel, guildId, audioResource: createAudioResource(createReadStream(soundCommand.file), { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName };
		resource.audioResource.volume.setVolume(soundCommand.volume);
		resources.push(resource);
		if (connection == undefined) {
			this.play();
		}
	}

	async queueYt(interaction, url) {
		let userId = interaction.user.id;
		let guildId = interaction.guildId;
		let voiceChannel;
		const guild = await client.guilds.cache.get(guildId);

		guild.channels.cache.forEach(channel => {
			if (channel.type === 'GUILD_VOICE') {
				channel.members.forEach(member => {
					if (member.id === userId) {
						voiceChannel = channel;
					}
				});
			}
		});

		//not in a voice channel
		if (voiceChannel === undefined) {
			await interaction.editReply('Must be in a voice channel for this command');
			return;
		}

		const ytStream = ytdl(url, { filter: 'audioonly' });
		
		let info = await ytdl.getInfo(url);
		let resource = { interaction, voiceChannel, guildId, audioResource: createAudioResource(ytStream, { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName: undefined, url, title: info.videoDetails.title };
		resource.audioResource.volume.setVolume(0.3);
		resources.push(resource);
		if (connection == undefined) {
			this.play();
		}
	}

	async queueApi(commandName, channelId, guildId) {
		const guild = await client.guilds.cache.get(guildId);
		const voiceChannel = await guild.channels.cache.get(channelId);

		//getting sound command
		let soundCommand = await client.db.getSoundCommand(commandName);
		if (soundCommand.file === undefined) {
			//no command found
			console.log('Sound command not found');
			return;
		}
		let resource = { interaction: undefined, voiceChannel, guildId, audioResource: createAudioResource(createReadStream(soundCommand.file), { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName };
		resource.audioResource.volume.setVolume(soundCommand.volume);
		resources.push(resource);
		if (connection == undefined) {
			this.play();
		}
	}

	play() {
		const [resource] = resources;

		connection = joinVoiceChannel({
			channelId: resource.voiceChannel.id,
			guildId: resource.guildId,
			adapterCreator: resource.voiceChannel.guild.voiceAdapterCreator,
		});

		connection.subscribe(player);

		player.play(resource.audioResource);

		resource.audioResource.playStream.on('end', () => {
			if (resource.interaction !== undefined) {
				if (resource.commandName !== undefined) {
					client.db.addUserSoundboard(resource.interaction.user.id, resource.commandName, resource.interaction.createdTimestamp);
				}
				try {
					resource.interaction.deleteReply();
				} catch (error) {
					console.log(error);
				}
			}
			resources.shift();
		});
	}


	stop() {
		if (connection !== undefined) {
			resources.forEach(resource => {
				if (resource.interaction !== undefined) {
					try {
						resource.interaction.deleteReply();
					} catch (error) {
						console.log(error);
					}
				}
			});
			resources = [];
			if (connection !== undefined) {
				connection.destroy();
				connection = undefined;
			}
		}
	}

	skip() {
		if (connection !== undefined) {
			const [resource] = resources;
			if (resource.interaction !== undefined) {
				try {
					resource.interaction.deleteReply();
				} catch (error) {
					console.log(error);
				}
			}
			resources.shift();
			player.stop();
		}
	}
}
module.exports = SoundManager;