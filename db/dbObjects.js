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

module.exports = {Users};
