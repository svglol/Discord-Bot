import {
	Table,
	Column,
	Model,
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import User from './User.model';
  
  @Table({ timestamps: false })
export default class Quote extends Model {
	@Column
		date: number;
  
	@Column
		quote: string;
  
	@Column
		messageId: string;
  
	@ForeignKey(() => User)
	@Column
		userId: string;
  
	@BelongsTo(() => User)
		user: User;
}
  