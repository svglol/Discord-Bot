'use strict';

var _express = require('express');

var router = _express.Router();

var client;

/* GET users listing. */
router.get('/users', function (req, res, next) {
  var users = client.getDbHelper().getUsers();
  res.json(users);
});

/* GET user by ID. */
router.get('/users/:id', function (req, res, next) {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < users.length) {
    res.json(users[id]);
  } else {
    res.sendStatus(404);
  }
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
