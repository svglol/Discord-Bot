import { Sequelize } from "sequelize/types";
import { Connection } from "sequelize/types/lib/connection-manager";
import Message from "../../db/models/Message.model";
import Quote from "../../db/models/Quote.model";
import Soundboard from "../../db/models/Soundboard.model";
import SoundCommand from "../../db/models/SoundCommand.model";
import TextCommand from "../../db/models/TextCommand.model";
import User from "../../db/models/User.model";

export interface Database {
	sequelize: Sequelize;
	getUser(id: string): Promise<User>;
	getUsers(): Promise<User[]>;
	addUser(id: string): Promise<User>;
	addMessage(id: string, date: number): Promise<Message>;
	updateUserLastConnection(id: string, lastConnection: number): Promise<User>;
	addUserConnection(id: string): Promise<Connection>;
	getSoundCommands(): Promise<SoundCommand[]>;
	getSoundCommand(commandName: string): Promise<SoundCommand>;
	addUserSoundboard(
		id: string,
		command: string,
		date: number
	): Promise<Soundboard>;
	getTopSoundCommands(): Promise<SoundCommand[]>;
	getTextCommands(): Promise<TextCommand[]>;
	getTextCommand(commandName: string): Promise<TextCommand>;
	getQuotes(): Promise<Quote[]>;
	getQuote(id: number): Promise<Quote>;
	addQuote(userId: string, quote: string, date: number, messageId: string);
}
