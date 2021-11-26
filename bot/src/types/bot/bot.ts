import { Database } from "..";
import {
	Client,
	Collection,
	CommandInteraction,
	VoiceChannel,
} from "discord.js";
import { AudioResource, VoiceConnection } from "@discordjs/voice";
import Keyv = require("keyv");
import { SlashCommandBuilder } from "@discordjs/builders";

export interface BotClient extends Partial<Client> {
	loadCommands(): void;
	db: Database;
	soundManager: BotSoundManager;
	deployCommands: BotDeployCommands;
	commands: Collection<string, BotCommand>;
	startTime: number;
	keyv: Keyv;
}

export interface BotSoundManager {
	client: BotClient;
	resources: Array<BotAudioResource>;
	connection: VoiceConnection;
	queue(
		interaction?: CommandInteraction,
		commandName?: string,
		url?: string,
		channelId?: string,
		guildId?: string
	): Promise<void>;
	play(): void;
	stop(): void;
	skip(): void;
	pause(): void;
}

export interface BotDeployCommands {
	client: BotClient;
	deploy(): void;
}

export interface BotEvent {
	name: string;
	once?: boolean;
	execute(...args): Promise<void>;
}

export interface BotCommand {
	data: SlashCommandBuilder;
	execute(interaction: CommandInteraction): Promise<void>;
	client?: BotClient;
	adminOnly?: boolean;
	needsClient?: boolean;
	setClient?(client: BotClient): Promise<void>;
}
export interface BotAudioResource {
	interaction?: CommandInteraction;
	voiceChannel: VoiceChannel;
	guildId: string;
	audioResource: AudioResource;
	commandName?: string;
	url?: string;
	title?: string;
}
