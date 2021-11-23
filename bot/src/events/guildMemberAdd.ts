import { BotEvent } from '../types';
export default {
	name: 'guildMemberAdd',
	execute(member) {
		member.client.dbHelper.addUser(member.id);
	},
} as BotEvent;