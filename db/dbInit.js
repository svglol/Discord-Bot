const Sequelize = require('sequelize');
const fs = require("fs");

module.exports = {
  init: function(client){
    client.getLogger().log('info', 'Database Initializing')
    const sequelize = new Sequelize('database', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'database.sqlite',
    })

    const User = sequelize.import('models/Users');
    const UserConnection = sequelize.import('models/UserConnection');
    const UserMessage = sequelize.import('models/UserMessage');
    const UserSoundboard = sequelize.import('models/UserSoundboard');

    const CommandVolume = sequelize.import('models/CommandVolume');
    const GifCommands = sequelize.import('models/GifCommands');

    const force = process.argv.includes('--force') || process.argv.includes('-f');

    sequelize.sync({ force }).then(async () => {

      //add gifs to database from old json file if it exists
      if(fs.existsSync('./commands/gifcommands.json')) {
        const gifCommands = require('../commands/gifcommands.json').commands;
        for(command of gifCommands){
          var gifCommand = await GifCommands.findOne({ where: { command: command.command} });
          if(!gifCommand){
            gifCommand = await GifCommands.create({ command: command.command,link:command.link,date:0});
          }
        }
      }

      sequelize.close();
      client.getLogger().log('info', 'Database Initialized')
      //
    }).catch(console.error);
  }
};
