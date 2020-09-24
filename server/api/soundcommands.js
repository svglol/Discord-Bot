'use strict';

var _express = require('express');

var router = _express.Router();

var client;

var fs = require('fs');

/* GET soundcommands listing. */
router.get('/soundcommands', function (req, res, next) {
  client.getDbHelper().getSoundCommands().then(value => {
    client.getLogger().log('info', 'GET - ' + req.originalUrl);
    res.json(value);
  });
});

// Get sound file by ID
router.get('/soundcommands/file/:id', function (req, res, next) {
  client.getLogger().log('info', 'GET - ' + req.originalUrl);
  var id = req.params.id;
  client.getDbHelper().getSoundCommands().then(value => {
    var soundCommand;
    value.forEach((item, i) => {
      if (item.dataValues.id === parseInt(id)) {
        soundCommand = item.dataValues;
        var file = soundCommand.file;
        var data = fs.readFileSync(file);
        res.json({sound: data.toString('base64')});
      }
    });
  });
});

// Remove sound command
router.delete('/soundcommands/:commandName', function (req, res) {
  client.getLogger().log('info', 'DELETE - ' + req.originalUrl);
  let commandName = req.params.commandName;
  client.getDbHelper().deleteSoundCommand(commandName);
  client.commands.delete(commandName);
  res.send(200);
});

// update sound command
router.post('/soundcommands/:id', function (req, res) {
  client.getLogger().log('info', 'POST - ' + req.originalUrl);
  // var body = req.body;
  // client.getDbHelper().editGifCommand(body.id, body.command, body.link);
  // client.commands.delete(body.command);
  // client.getCommandsLoader().addGifCommand(client, body.command, body.link);
  // res.sendStatus(200);
});

// add sound command
router.put('/soundcommands/', function (req, res) {
  client.getLogger().log('info', 'PUT - ' + req.originalUrl);
  // var body = req.body;
  // client.getDbHelper().addGifCommand(body.command, body.link, new Date().getTime()).then((result) => {
  //   res.json({id: result.dataValues.id, command: result.dataValues.command, link: result.dataValues.link,date: result.dataValues.date});
  // });
  // client.getCommandsLoader().addGifCommand(client, body.command, body.link);
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
