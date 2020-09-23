'use strict';

var _express = require('express');

var _users = require('./users');
var _soundcommands = require('./soundcommands');
var _gifcommands = require('./gifcommands');

var router = _express.Router();

// Add USERS Routes
router.use(_users.router);
router.use(_soundcommands.router);
router.use(_gifcommands.router);

module.exports = {
  router,
  init: async function (client) {
    _soundcommands.init(client);
    _users.init(client);
    _gifcommands.init(client);
  }
};
