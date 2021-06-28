const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'resources/database.sqlite'
});

const Users = sequelize.import('models/Users');
const UserConnection = sequelize.import('models/UserConnection');
const UserMessage = sequelize.import('models/UserMessage');
const UserSoundboard = sequelize.import('models/UserSoundboard');
const GifCommands = sequelize.import('models/GifCommands');
const SoundCommands = sequelize.import('models/SoundCommands');

Users.prototype.addMessage = async function (id, date) {
  return UserMessage.create({user_id: this.user_id, date: date});
};

Users.prototype.getMessages = function () {
  return UserMessage.findAll({
    where: { user_id: this.user_id }
  });
};

Users.prototype.getConnections = function () {
  return UserConnection.findAll({
    where: { user_id: this.user_id }
  });
};

Users.prototype.getSoundboards = function () {
  return UserSoundboard.findAll({
    where: { user_id: this.user_id }
  });
};

Users.prototype.addConnection = async function (id, connectTime, disconnectTime, connectionLength) {
  return UserConnection.create({user_id: this.user_id, connectTime: connectTime, disconnectTime: disconnectTime, connectionLength: connectionLength});
};

Users.prototype.addSoundboard = async function (id, date, command) {
  return UserSoundboard.create({user_id: this.user_id, date: date, command: command});
};
module.exports = {Users, UserSoundboard, UserMessage, UserConnection, GifCommands, SoundCommands};
