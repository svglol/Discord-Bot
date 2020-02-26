const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: console.log(),
	storage: 'database.sqlite',
});

const Users = sequelize.import('models/Users');
const UserConnection = sequelize.import('models/UserConnection');
const UserMessage = sequelize.import('models/UserMessage');
const UserSoundboard = sequelize.import('models/UserSoundboard');

Users.prototype.addMessage = async function(id,date) {
	return UserMessage.create({ user_id: this.user_id, date: date});
};

Users.prototype.getMessages = function() {
	return UserMessage.findAll({
		where: { user_id: this.user_id }
	});
};
module.exports = {Users};
