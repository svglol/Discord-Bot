import { Database } from '..';
import { Client, CommandInteraction, VoiceChannel } from 'discord.js';
import { AudioResource, VoiceConnection } from '@discordjs/voice';

export interface BotClient extends Partial<Client>{
    loadCommands(): void
    db: Database
    soundManager : BotSoundManager
    deployCommands: BotDeployCommands
    commands: any
    startTime: any
    keyv: any
}

export interface BotSoundManager {
    client: BotClient
    resources: Array<BotAudioResource>
    connection: VoiceConnection
    queue(interaction : CommandInteraction, commandName : string) : void
    queueYt(interaction : CommandInteraction, url : string) : void
    queueApi(commandName : string, channelId : string, guildId : string) : void
    play() : void
    stop() : void
    skip() : void
    pause() : void
}

export interface BotDeployCommands {
    client: BotClient
    deploy() : void
}

export interface BotEvent{
    name : string
    once? : boolean
    execute(...args) : Promise<void>
}

export interface BotCommand{
	[x: string]: any;
    data : any
    execute(interaction : any) : Promise<void>
    adminOnly? : boolean
    needsClient? : boolean
    setClient?(client : BotClient) :  Promise<void>
}
export interface BotAudioResource {
    interaction? : CommandInteraction;
    voiceChannel : VoiceChannel;
    guildId : string;
    audioResource : AudioResource;
    commandName? : string;
    url? : string;
    title? : string;
}