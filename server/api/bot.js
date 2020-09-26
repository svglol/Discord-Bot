'use strict';

var _express = require('express');

var router = _express.Router();

var client;

router.post('/bot/', function (req, res) {
  client.getLogger().log('info', 'PUT - ' + req.originalUrl);
  var body = req.body;
  if (body.skip) {
    client.getSound().skip();
    res.sendStatus(200);
  } else if (body.stop) {
    client.getSound().stop();
    res.sendStatus(200);
  } else if (body.play) {
    let command = body.sound;
    let cmd = client.commands.get(command);
    let sound = {file: cmd.file, command: cmd.name, volume: cmd.volume};
    let chan = client.channels.cache.get(body.channel);
    client.getSound().queueToChannel(chan, sound, true);
    res.sendStatus(200);
  } else if (body.message) {
    let chan = client.channels.cache.get(body.channel);
    chan.send(body.message);
    res.sendStatus(200);
  } else if (body.clear) {
    let chan = client.channels.cache.get(body.channel);
    chan.messages.fetch(5).then(messages => {
      let messagesToDelete = [];
      messages.forEach(chatMessage => {
        if (chatMessage.content.charAt(0) === client.getPrefix()) {
          messagesToDelete.push(chatMessage);
        }
        if (chatMessage.author.bot) {
          messagesToDelete.push(chatMessage);
        }
      });
      chan.bulkDelete(messagesToDelete);
    });
  } else if (body.reset) {
    client.getLogger().log('info', 'Reset Initiated');
    client.getSound().stop();
    res.sendStatus(200);
    process.exit(1);
  }
});

// send bot status
router.get('/bot/', function (req, res) {
  client.getLogger().log('info', 'PUT - ' + req.originalUrl);
  let totalUsers = 0;
  let onlineUsers = 0;
  let connectedUsers = 0;
  client.guilds.cache.forEach((guild, i) => {
    totalUsers += guild.memberCount;
    onlineUsers += guild.members.cache.filter(m => m.presence.status === 'online').size;
    connectedUsers += guild.members.cache.filter(m => m.voice.channel !== null).size;
  });

  let bot = {uptime: client.getStartTime(), totalUsers: totalUsers, onlineUsers: onlineUsers, connectedUsers: connectedUsers};
  res.json(bot);
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
