import { DataTypes } from 'sequelize';
import { Table, Column, Model, HasMany} from 'sequelize-typescript';
import Connection from './Connection.model';
import Message from './Message.model';
import Quote from './Quote.model';
import Soundboard from './Soundboard.model';

@Table({ timestamps: false })
export default class User extends Model {

	@Column({
		type: DataTypes.STRING,
		primaryKey: true
	})
		id: string;

		@Column({
			type: DataTypes.INTEGER,
			defaultValue: 0
		})
			lastConnection: number;

			@Column
				username: string;

			@Column
				intro: string;

			@Column
				exit: string;

	@HasMany(() => Connection,{as: 'connections', foreignKey : 'userId'})
		connections: Connection[];

	@HasMany(() => Message, {as: 'messages', foreignKey : 'userId'})
		messages: Message[];

	@HasMany(() => Quote,{as: 'quotes', foreignKey : 'userId'})
		quotes: Quote[];

	@HasMany(() => Soundboard,{as: 'soundboards', foreignKey : 'userId'})
		soundboards: Soundboard[];
}