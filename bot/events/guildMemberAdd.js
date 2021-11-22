module.exports = {
	name: 'guildMemberAdd',
	execute(member) {
		member.client.dbHelper.addUser(member.id);
	},
};