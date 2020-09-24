'use strict';

var _express = require('express');

var router = _express.Router();

var client;

// get gif commands
router.get('/gifcommands', function (req, res, next) {
  client.getDbHelper().getGifCommands().then(value => {
    client.getLogger().log('info', 'GET - ' + req.originalUrl);
    res.json(value);
  });
});

// delete gif command
router.delete('/gifcommands/:commandName', function (req, res) {
  client.getLogger().log('info', 'DELETE - ' + req.originalUrl);
  let commandName = req.params.commandName;
  client.getDbHelper().deleteGifCommand(commandName);
  client.commands.delete(commandName);
  res.send('Deleted');
});

// update gif command
router.post('/gifcommands/:id', function (req, res) {
  console.log(req.params);
  client.getLogger().log('info', 'POST - ' + req.originalUrl);
  // console.log(req)
  res.send('POST request to the homepage');
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
