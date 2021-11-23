import { Database } from '..';
import { Client, CommandInteraction } from 'discord.js';

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
    resources: Array<any>
    queue(interaction : CommandInteraction, commandName : string) : void
    queueYt(interaction : CommandInteraction, url : string) : void
    queueApi(commandName : string, channelId : string, guildId : string) : void
    play() : void
    stop() : void
    skip() : void
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
    data : any
    execute(interaction : any) : Promise<void>
    adminOnly? : boolean
    needsClient? : boolean
    setClient?(client : BotClient) :  Promise<void>
}