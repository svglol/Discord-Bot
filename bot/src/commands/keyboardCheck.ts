import { SlashCommandBuilder } from '@discordjs/builders';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { createReadStream } from 'fs';
import ytdl = require('ytdl-core');
import { BotAudioResource, BotClient, BotCommand } from '../types';
let client: BotClient;
export default {
	data: new SlashCommandBuilder()
		.setName('keyboardcheck')
		.setDescription('Keyboard check')
		.setDefaultPermission(false),
	async execute(interaction : CommandInteraction) {
		await interaction.deferReply();
		const userId = interaction.user.id;
		const guildId = interaction.guildId;
		const textChannel = interaction.channel;
		let voiceChannel;
		let voiceChannel2;
		const guild = await client.guilds.cache.get(guildId);

		guild.channels.cache.forEach(channel => {
			if (channel.type === 'GUILD_VOICE') {
				channel.members.forEach(member => {
					if (member.id === userId) {
						voiceChannel = channel;
					}
				});
				if(channel.name === '📢BR0KEN kEYBOARD ZONE📢'){
					voiceChannel2 = channel;
				}	
			}
		});

		//not in a voice channel
		if (voiceChannel == undefined) {
			await interaction.editReply('Must be in a voice channel for this command');
			return;
		}

		let newResource : BotAudioResource ;
		if(client.soundManager.resources.length > 0){
			//sound already queued/playing
			const resource = client.soundManager.resources[0];
			client.soundManager.resources.shift();
			client.soundManager.pause();

			//recreate resource that was playing
			newResource = {interaction : resource.interaction, voiceChannel: resource.voiceChannel,audioResource: null, guildId: resource.guildId, commandName : resource.commandName, title: resource.title, url: resource.url};
			if(newResource.commandName != undefined){
				const soundCommand = await client.db.getSoundCommand(newResource.commandName);
				newResource.audioResource = createAudioResource(createReadStream(soundCommand.file), { inputType: StreamType.Arbitrary, inlineVolume: true });
				newResource.audioResource.volume.setVolume(soundCommand.volume);
			}else if(newResource.url != undefined){
				const ytStream = ytdl(newResource.url, { filter: 'audioonly' });
				newResource.audioResource = createAudioResource(ytStream, { inputType: StreamType.Arbitrary, inlineVolume: true });
				newResource.audioResource.volume.setVolume(0.3);
			}
		}

		const dennyResource : BotAudioResource = { interaction: undefined, voiceChannel: voiceChannel2, guildId, audioResource: createAudioResource(createReadStream('./denny.wav'), { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName: undefined, title: 'Denny'};
		const keyboardCheckResource : BotAudioResource = { interaction: undefined, voiceChannel, guildId, audioResource: createAudioResource(createReadStream('./keyboard_check.wav'), { inputType: StreamType.Arbitrary, inlineVolume: true }), commandName: undefined, title: 'Keyboard Check'};
		keyboardCheckResource.audioResource.volume.setVolume(0.3);
		dennyResource.audioResource.volume.setVolume(0.3);
		
		if(newResource != undefined){
			client.soundManager.resources.unshift(newResource);
		}
		client.soundManager.resources.unshift(dennyResource);
		client.soundManager.resources.unshift(keyboardCheckResource);

		
		client.soundManager.play();
		interaction.editReply('Keyboard Check!');
		
		const collector = textChannel.createMessageCollector({ time: 10830 });
		const usersToNotMove = [];
		collector.on('collect', m => {
			usersToNotMove.push(m.author.id);
		});

		collector.on('end', () => {
			voiceChannel.members.forEach(member => {
				if (!usersToNotMove.includes(member.id) && !member.user.bot) {
					member.voice.setChannel(voiceChannel2);
				}
			});
		});

	},
	needsClient: true,
	async setClient(client_ : BotClient) {
		client = client_;
	},
	adminOnly: true
} as BotCommand;