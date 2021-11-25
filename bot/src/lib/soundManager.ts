import { createReadStream } from 'fs';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, StreamType, VoiceConnection } from '@discordjs/voice';
import ytdl = require('ytdl-core');
const player = createAudioPlayer();
import { BotAudioResource, BotClient, BotSoundManager } from '../types';

export class SoundManager implements BotSoundManager{
	client: BotClient;
	resources: BotAudioResource[];
	connection: VoiceConnection;
	constructor(discordClient) {
		this.client = discordClient;
		this.resources = [];

		player.on('error', error => {
			console.error(`Error: ${error.message} with resource ${error.resource}`);
			if (this.resources.length === 0) {
				if (this.connection !== undefined) {
					this.connection.destroy();
					this.connection = undefined;
				}
			}
			else {
				this.play();
			}
		});

		player.on(AudioPlayerStatus.Idle, () => {
			if (this.resources.length === 0) {
				if (this.connection !== undefined) {
					this.connection.destroy();
					this.connection = undefined;
				}
			}
			else {
				this.play();
			}
		});
	}

	async queue(interaction, commandName) {
		//getting user voice channel
		const userId = interaction.user.id;
		const guildId = interaction.guildId;

		let voiceChannel;

		const guild = await this.client.guilds.cache.get(guildId);

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
		const soundCommand = await this.client.db.getSoundCommand(commandName);
		if (soundCommand === undefined || soundCommand === null) {
			//no command found
			await interaction.editReply(`Sound command not found ${commandName}`);
			return;
		}


		const resource : BotAudioResource = { interaction, voiceChannel, guildId, audioResource: createAudioResource(createReadStream(soundCommand.file), { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName };
		resource.audioResource.volume.setVolume(soundCommand.volume);
		this.resources.push(resource);
		if (this.connection == undefined) {
			this.play();
		}
	}

	async queueYt(interaction, url) {
		const userId = interaction.user.id;
		const guildId = interaction.guildId;
		let voiceChannel;
		const guild = await this.client.guilds.cache.get(guildId);

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
		
		const info = await ytdl.getInfo(url);
		const resource : BotAudioResource = { interaction, voiceChannel, guildId, audioResource: createAudioResource(ytStream, { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName: undefined, url, title: info.videoDetails.title };
		resource.audioResource.volume.setVolume(0.3);
		this.resources.push(resource);
		if (this.connection == undefined) {
			this.play();
		}
	}

	async queueApi(commandName, channelId, guildId) {
		const guild = await this.client.guilds.cache.get(guildId);
		let voiceChannel;

		guild.channels.cache.forEach(channel => {
			if (channel.type === 'GUILD_VOICE') {
				if(channel.id == channelId){
					voiceChannel = channel;
				}
			}
		});

		//getting sound command
		const soundCommand = await this.client.db.getSoundCommand(commandName);
		if (soundCommand.file === undefined) {
			//no command found
			console.log('Sound command not found');
			return;
		}
		const resource : BotAudioResource = { interaction: undefined, voiceChannel, guildId, audioResource: createAudioResource(createReadStream(soundCommand.file), { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName };
		resource.audioResource.volume.setVolume(soundCommand.volume);
		this.resources.push(resource);
		if (this.connection == undefined) {
			this.play();
		}
	}

	play() {
		const [resource] = this.resources;

		this.connection = joinVoiceChannel({
			channelId: resource.voiceChannel.id,
			guildId: resource.guildId,
			adapterCreator: resource.voiceChannel.guild.voiceAdapterCreator,
		});

		this.connection.subscribe(player);

		player.play(resource.audioResource);

		resource.audioResource.playStream.on('end', () => {
			if (resource.interaction !== undefined) {
				if (resource.commandName !== undefined) {
					this.client.db.addUserSoundboard(resource.interaction.user.id, resource.commandName, resource.interaction.createdTimestamp);
				}
				try {
					resource.interaction.deleteReply();
				} catch (error) {
					console.log(error);
				}
			}
			this.resources.shift();
		});
	}


	stop() {
		if (this.connection !== undefined) {
			this.resources.forEach(resource => {
				if (resource.interaction !== undefined) {
					try {
						resource.interaction.deleteReply();
					} catch (error) {
						console.log(error);
					}
				}
			});
			this.resources = [];
			if (this.connection !== undefined) {
				this.connection.destroy();
				this.connection = undefined;
			}
		}
	}

	skip() {
		if (this.connection !== undefined) {
			const [resource] = this.resources;
			if (resource.interaction !== undefined) {
				try {
					resource.interaction.deleteReply();
				} catch (error) {
					console.log(error);
				}
			}
			this.resources.shift();
			player.stop();
		}
	}

	pause(){
		if (this.connection !== undefined) {
			player.pause();
		}
	}
}