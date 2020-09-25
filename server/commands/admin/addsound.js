const https = require('https');
const fs = require('fs');

module.exports = {
  name: 'addsound',
  description: 'Add a sound command',
  adminOnly: true,
  args: true,
  numArgs: 1,
  usage: '<command>',
  execute (message, args, client) {
    var commandName = args[0];
    if (client.commands.get(commandName)) return message.reply('That command name is already taken');
    if (message.attachments.size === 0) return message.reply('No attachment found');

    for (const [key, attachment] of message.attachments.entries()) {
      var wav = /^[^.]+.wav$/;
      var mp3 = /^[^.]+.mp3$/;
      var ogg = /^[^.]+.ogg$/;
      if (wav.test(attachment.name) || mp3.test(attachment.name) || ogg.test(attachment.name)) {
        var dir = './resources/sound/';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync('./resources');
          fs.mkdirSync('./resources/sound');
        }
        var extension = attachment.name.substring(attachment.name.lastIndexOf('.') + 1);
        var path = './resources/sound/' + commandName + '.' + extension;
        const file = fs.createWriteStream(path);
        https.get(attachment.url, async function (response) {
          await response.pipe(file);
          client.getDbHelper().addSoundCommand(commandName, path, 1, new Date().getTime());
          client.getCommandsLoader().addSoundCommand(client, commandName, path, 1, new Date().getTime());
          message.delete().catch(err => console.log(err));
        });
      } else {
        message.reply('Sound file must be a wav,mp3,ogg');
      }
    }
  }
};
