'use strict';

var _express = require('express');

var _users = require('./users');
var _soundcommands = require('./soundcommands');
var _gifcommands = require('./gifcommands');
var _discord = require('./discord');
var _bot = require('./bot')

var router = _express.Router();
router.use(_express.json());

// Add USERS Routes
router.use(_users.router);
router.use(_soundcommands.router);
router.use(_gifcommands.router);
router.use(_discord.router);
router.use(_bot.router);

module.exports = {
  router,
  init: async function (client) {
    _soundcommands.init(client);
    _users.init(client);
    _gifcommands.init(client);
    _discord.init(client);
    _bot.init(client);
  }
};
