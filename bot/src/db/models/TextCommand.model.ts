import { Table, Column, Model} from 'sequelize-typescript';

@Table({ timestamps: false })
export default class TextCommand extends Model {

	@Column
		command: string;
		
		@Column
			link: string;

			@Column
				date: number;

}