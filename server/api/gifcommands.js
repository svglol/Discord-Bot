'use strict';

var _express = require('express');

var router = _express.Router();

var client;

// get gif commands
router.get('/gifcommands', function (req, res, next) {
  client.dbHelper.getGifCommands().then(value => {
    client.logger.log('info', 'GET - ' + req.originalUrl);
    res.json(value);
  });
});

// delete gif command
router.delete('/gifcommands/:commandName', function (req, res) {
  client.logger.log('info', 'DELETE - ' + req.originalUrl);
  let commandName = req.params.commandName;
  client.dbHelper.deleteGifCommand(commandName);
  client.commands.delete(commandName);
  res.send('Deleted');
});

// update gif command
router.post('/gifcommands/:id', function (req, res) {
  client.logger.log('info', 'POST - ' + req.originalUrl);
  var body = req.body;

  client.dbHelper.getGifCommands().then(result => {
    result.forEach((item, i) => {
      if (item.dataValues.id === parseInt(req.body.id)) {
        client.dbHelper.editGifCommand(body.id, body.command, body.link);
        client.commands.delete(item.dataValues.command);
        client.commandsLoader.addGifCommand(client, body.command, body.link);
        res.sendStatus(200);
      }
    });
  });
});

// add gif command
router.put('/gifcommands/', function (req, res) {
  client.logger.log('info', 'PUT - ' + req.originalUrl);
  var body = req.body;
  client.dbHelper.addGifCommand(body.command, body.link, new Date().getTime()).then((result) => {
    res.json({id: result.dataValues.id, command: result.dataValues.command, link: result.dataValues.link, date: result.dataValues.date});
  });
  client.commandsLoader.addGifCommand(client, body.command, body.link);
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
