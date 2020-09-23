const https = require('https');
const fs = require('fs');

module.exports = {
  name: 'removesound',
  description: 'Remove a sound command',
  adminOnly: true,
  args: true,
  numArgs: 1,
  usage: '<command>',
  execute (message, args, client) {
    var commandName = args[0];
    if (!client.commands.get(commandName)) return message.reply('No command with that name found');

    client.getDbHelper().deleteSoundCommand(commandName);
    var cmd = client.commands.get(commandName);
    fs.unlinkSync(cmd.file);
    client.commands.delete(commandName);

    message.delete().catch(err => console.log(err));
  }
};
