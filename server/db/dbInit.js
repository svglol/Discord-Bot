const Sequelize = require('sequelize');

module.exports = {
  init: async function (client) {
    client.logger.log('info', 'Database Initializing');
    const sequelize = new Sequelize('database', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'resources/database.sqlite'
    });

    sequelize.import('models/Users');
    sequelize.import('models/UserConnection');
    sequelize.import('models/UserMessage');
    sequelize.import('models/UserSoundboard');

    sequelize.import('models/GifCommands');
    sequelize.import('models/SoundCommands');

    sequelize.sync();
  }
};
