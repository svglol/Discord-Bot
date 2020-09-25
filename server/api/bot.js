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
  }
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
