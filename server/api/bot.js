'use strict';

var _express = require('express');

var router = _express.Router();

class Bot {
  constructor (client) {
    this.router = router;

    router.post('/bot/', function (req, res) {
      var body = req.body;
      client.logger.log('info', 'PUT - ' + req.originalUrl + ' - ' + JSON.stringify(body));
      if (body.skip) {
        client.soundManager.skip();
        res.sendStatus(200);
      } else if (body.stop) {
        client.soundManager.stop();
        res.sendStatus(200);
      } else if (body.play) {
        let command = body.sound.replace(/['"]+/g, '');
        let cmd = client.commands.get(command);
        let sound = {file: cmd.file, command: cmd.name, volume: cmd.volume};
        let chan = client.channels.cache.get(body.channel);
        client.soundManager.queueToChannel(chan, sound, true);
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
            if (chatMessage.content.charAt(0) === client.prefix) {
              messagesToDelete.push(chatMessage);
            }
            if (chatMessage.author.bot) {
              messagesToDelete.push(chatMessage);
            }
          });
          chan.bulkDelete(messagesToDelete);
        });
      } else if (body.reset) {
        client.logger.log('info', 'Reset Initiated');
        client.soundManager.stop();
        res.sendStatus(200);
        process.exit(1);
      }
    });

    // get bot status
    router.get('/bot/', function (req, res) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      let totalUsers = 0;
      let onlineUsers = 0;
      let connectedUsers = 0;
      client.guilds.cache.forEach((guild, i) => {
        totalUsers += guild.memberCount;
        onlineUsers += guild.members.cache.filter(m => m.presence.status === 'online').size;
        connectedUsers += guild.members.cache.filter(m => m.voice.channel !== null).size;
      });

      let bot = {uptime: client.startTime, totalUsers: totalUsers, onlineUsers: onlineUsers, connectedUsers: connectedUsers};
      res.json(bot);
    });

    router.get('/bot/log', function (req, res) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      res.json(client.getLog());
    });
  }
}

module.exports = Bot;
