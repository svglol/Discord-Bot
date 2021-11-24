import {
	Table,
	Column,
	Model,
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import User from './User.model';
  
  @Table({ timestamps: false })
export default class Connection extends Model {
	@Column
		connectTime: number;
  
	@Column
		disconnectTime: number;
  
	@Column
		connectionLength: number;
  
	@ForeignKey(() => User)
	@Column
		userId: string;
  
	@BelongsTo(() => User)
		user: User;
}  