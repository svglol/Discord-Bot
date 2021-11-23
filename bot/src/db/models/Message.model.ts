import { Table, Column, Model, ForeignKey, BelongsTo} from 'sequelize-typescript';
import User from './User.model';

@Table({ timestamps: false })
export default class Message extends Model {

	@Column
		date: number;

			@ForeignKey(() => User)
	@Column
				userId: string;

				@BelongsTo(() => User, 'userId')
					user: User;
}