'use strict';

var _express = require('express');

var router = _express.Router();

var client;

// get gif commands
router.get('/discord/getUsername/:id', function (req, res, next) {
  res.json(client.users.cache.get(req.params.id));
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
