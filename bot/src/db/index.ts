import { Database } from '../types';
import { Sequelize } from 'sequelize-typescript';
import User from './models/User.model';
import Connection from './models/Connection.model';
import Message from './models/Message.model';
import Quote from './models/Quote.model';
import Soundboard from './models/Soundboard.model';
import SoundCommand from './models/SoundCommand.model';
import TextCommand from './models/TextCommand.model';

export class Db implements Database{
	sequelize: Sequelize;

	constructor(){
		this.sequelize = new Sequelize({
			host: 'localhost',
			dialect: 'sqlite',
			logging: false,
			storage: '../resources/database.sqlite',
			models: [User,Message,Connection,Quote,Soundboard,SoundCommand,TextCommand]
		});
	}

	async updateUserLastConnection(id: string, lastConnection: number): Promise<User> {
		const user_ = await User.findByPk(id);
		if (user_ != null) {
			user_.lastConnection = lastConnection;
			return await user_.save();
		} else {
			return await User.create({ id: id, lastConnection: lastConnection });
		}
	}

	async addUserConnection(id: string): Promise<Connection> {
		let user_ = await User.findByPk(id);
		if (!user_) {
			user_ = await this.addUser(id);
		}
		const date = new Date();
		const lastConnection = user_.lastConnection;
		await this.updateUserLastConnection(id, 0);
		if (lastConnection !== 0) {
			return await Connection.create({
				userId: id,
				connectTime: lastConnection,
				disconnectTime: date.getTime(),
				connectionLength: date.getTime() - lastConnection
			});
		}
	}

	getSoundCommands(): Promise<SoundCommand[]> {
		return SoundCommand.findAll();
	}
	getSoundCommand(commandName: string): Promise<SoundCommand> {
		return SoundCommand.findOne({ where: { command: commandName } });
	}
	async addUserSoundboard(id: string, command: string, date: number): Promise<Soundboard> {
		const user_ = User.findByPk(id);
		if (!user_) {
			await this.addUser(id);
		}
		return Soundboard.create({ userId: id, command, date });
	}
	async getTopSoundCommands(): Promise<SoundCommand[]> {
		const soundboardUsage = await Soundboard.findAll();

		const top = [];
		for (const userSoundboard of soundboardUsage) {
			const update = top.find(data => data.command === userSoundboard.command);
			if (update != null) {
				update.uses += 1;
			} else {
				top.push({ command: userSoundboard.command, uses: 1 });
			}
		}

		top.sort(function (a, b) {
			if (a.uses > b.uses) {
				return -1;
			}
			if (a.uses < b.uses) {
				return 1;
			}
			return 0;
		});
		top.length = 25;
		return top;
	}
	getTextCommands(): Promise<TextCommand[]> {
		return TextCommand.findAll();
	}
	getTextCommand(commandName: string): Promise<TextCommand> {
		return TextCommand.findOne({ where: { command: commandName } });
	}
	getQuotes(): Promise<Quote[]> {
		return Quote.findAll();
	}
	getQuote(id: number): Promise<Quote> {
		return Quote.findOne({ where: { id: id } });
	}
	async addQuote(userId: string, quote: string, date: number, messageId: string) {
		const user_ = await User.findByPk(userId);
		if (!user_) {
			await this.addUser(userId);
		}
		return await Quote.create({ userId, quote, date, messageId });
	}

	async addMessage(id: string, date: number): Promise<Message> {
		let user_ = await User.findByPk(id);
		if (!user_) {
			user_ = await this.addUser(id);
		}
		return Message.create({ userId: id, date: date });
	}

	async addUser(id: string): Promise<User> {
		let user_ = await User.findByPk(id);
		if (!user_) {
			user_ = await User.create({ id: id });
		}
		return user_;
	}

	getUser(id : string) : Promise<User>{
		return User.findByPk(id, {
			include: [
				{
					model: Message,
					as: 'messages',
					separate: true,
				},
				{
					model: Connection,
					as: 'connections',
					separate: true,
				},
				{
					model: Soundboard,
					as: 'soundboards',
					separate: true,
				},
				{
					model: Quote,
					as: 'quotes',
					separate: true,
				},
			]
		});
	}

	getUsers(): Promise<User[]> {
		return User.findAll({
			include: [
				{
					model: Message,
					as: 'messages',
					separate: true,
				},
				{
					model: Connection,
					as: 'connections',
					separate: true,
				},
				{
					model: Soundboard,
					as: 'soundboards',
					separate: true,
				},
				{
					model: Quote,
					as: 'quotes',
					separate: true,
				},
			]
		});
	}
}