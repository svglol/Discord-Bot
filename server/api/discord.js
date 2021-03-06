'use strict';

var _express = require('express');

var router = _express.Router();

class Discord {
  constructor (client) {
    this.router = router;

    router.get('/discord/getUsername/:id', function (req, res, next) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      res.json(client.users.cache.get(req.params.id));
    });

    // get if command is available
    router.get('/discord/command/:command', function (req, res, next) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      let command = req.params.command;
      if (client.commands.get(command)) {
        res.status(200).send('Command Taken'); // taken
      } else {
        res.sendStatus(200);// ok
      }
    });

    // get connected discord servers
    router.get('/discord/servers', function (req, res, next) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      res.json(client.guilds.cache);
    });

    // get server voice channels
    router.get('/discord/servers/:id/voicechannels', function (req, res, next) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      var guild = client.guilds.cache.get(req.params.id);
      res.json(guild.channels.cache.filter(c => c.type === 'voice'));
    });

    // get server text channels
    router.get('/discord/servers/:id/textchannels', function (req, res, next) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      var guild = client.guilds.cache.get(req.params.id);
      res.json(guild.channels.cache.filter(c => c.type === 'text'));
    });
  }
}

module.exports = Discord;
