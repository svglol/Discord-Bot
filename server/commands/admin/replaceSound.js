const https = require('https');
const fs = require('fs');

module.exports = {
  name: 'replacesound',
  description: 'Replace a sound command',
  adminOnly: true,
  args: true,
  numArgs: 1,
  usage: '<command>',
  execute (message, args, client) {
    var commandName = args[0];
    if (!client.commands.get(commandName)) return message.reply('No command with that name found');
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
          message.delete().catch(err => console.log(err));
        });
      } else {
        message.reply('Sound file must be a wav,mp3,ogg');
      }
    }
  }
};
