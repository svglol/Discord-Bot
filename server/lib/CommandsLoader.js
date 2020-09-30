const glob = require('glob');

class CommandsLoader {
  constructor (client) {
    // load commands from database
    client.dbHelper.getGifCommands().then(gifCommands => {
      gifCommands.forEach((item, i) => {
        this.addGifCommand(client, item.dataValues.command, item.dataValues.link);
      });
    });
    client.dbHelper.getSoundCommands().then(soundCommands => {
      soundCommands.forEach((item, i) => {
        this.addSoundCommand(client, item.dataValues.command, item.dataValues.file, item.dataValues.volume, item.dataValues.date);
      });
    });

    // Load commands from files
    const commandFiles = glob.sync('server/commands' + '/**/*.js');
    for (let file of commandFiles) {
      const command = require(`${file.replace('server/', '../')}`);
      client.commands.set(command.name, command);
    }
  }

  addGifCommand (client, commandname, link) {
    var command = {
      name: commandname,
      description: 'Post ' + commandname + ' gif',
      gif: true,
      guildOnly: true,
      execute (message, args, client) {
        message.channel.send(link);
      }
    };
    client.commands.set(commandname, command);
  }

  addSoundCommand (client, commandname, file, volume, date) {
    var newSound = false;
    var now = new Date();
    var diff = Math.abs(date - now.getTime());
    var days = diff / (1000 * 60 * 60 * 24);
    if (days < 7) {
      newSound = true;
    }

    commandname = commandname.toString();

    var command = {
      name: commandname,
      description: 'Play ' + commandname + ' sound',
      soundboard: true,
      volume: volume,
      file: file,
      guildOnly: true,
      newSound: newSound,
      execute (message, args, client) {
        var end = false;
        var sound = {file: file, command: commandname, volume: this.volume};

        if (args.length === 0) end = true;
        client.soundManager.queue(message, sound, end);

        end = false;
        args.forEach((item, i) => {
          if (args.length === i + 1) end = true;
          var cmd = client.commands.get(item);
          if (cmd) {
            var sound = {file: cmd.file, command: cmd.name, volume: cmd.volume};
            client.soundManager.queue(message, sound, end);
          }
        });
      }
    };

    client.commands.set(commandname, command);
  }
}

module.exports = CommandsLoader;
