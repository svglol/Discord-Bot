const Sequelize = require('sequelize');
const fs = require("fs");

module.exports = {
  init: async function(client){
    client.getLogger().log('info', 'Database Initializing')
    const sequelize = new Sequelize('database', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'database.sqlite',
    })

    const Users = sequelize.import('models/Users');
    const UserConnection = sequelize.import('models/UserConnection');
    const UserMessage = sequelize.import('models/UserMessage');
    const UserSoundboard = sequelize.import('models/UserSoundboard');

    const GifCommands = sequelize.import('models/GifCommands');
    const SoundCommands = sequelize.import('models/SoundCommands');

    const force = process.argv.includes('--force') || process.argv.includes('-f');

    sequelize.sync({ force }).then(async () => {

      //add new columns to users table
      var queryInterface = sequelize.getQueryInterface();
      var table = await queryInterface.describeTable('users');
      if(table.intro == undefined){
        await queryInterface.addColumn('users', 'intro', Sequelize.STRING);
      }
      if(table.exit == undefined){
        await queryInterface.addColumn('users', 'exit',Sequelize.STRING);
      }

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

      //add intro and exit gifs from old json files if it exists
      if(fs.existsSync('./commands/intros.json')) {
        const intros = require('../commands/intros.json').intros;
        for(intro of intros){
          var user = await Users.findOne({ where: { user_id: intro.userid} });
          if(!user){
            user = await Users.create({ user_id: intro.userid});
          }
          user.intro = intro.link;
          user.save();
        }
      }

      if(fs.existsSync('./commands/exits.json')) {
        const exits = require('../commands/exits.json').exits;
        for(exit of exits){
          var user = await Users.findOne({ where: { user_id: exit.userid} });
          if(!user){
            user = await Users.create({ user_id: exit.userid});
          }
          user.exit = exit.link;
          user.save();
        }
      }

      //load sound commands into database
      var soundCommands = await SoundCommands.findAll();
      var files = fs.readdirSync('./resources/sound/');
      for(file of files){
        var command = client.getTools().createCommand(file);
        var soundCommand = await SoundCommands.findOne({ where: { command: command} });
        if(!soundCommand){
          var mtime = fs.statSync('./resources/sound/'+file).mtime.getTime();
          soundCommand = await SoundCommands.create({ command: command,file:'./resources/sound/'+file,volume:1,date:mtime});
        }
      }

      sequelize.close();
      client.getLogger().log('info', 'Database Initialized')
      //
    }).catch(console.error);
  }
};
