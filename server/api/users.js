'use strict';

var _express = require('express');

var router = _express.Router();

var client;

/* GET users listing. */
router.get('/users', function (req, res, next) {
  var users = client.dbHelper.getUsers();
  client.logger.log('info', 'GET - ' + req.originalUrl);
  res.json(users);
});

/* GET user by ID. */
router.get('/users/:id', function (req, res, next) {
  let id = req.params.id;
  client.logger.log('info', 'GET - ' + req.originalUrl);
  let users = client.dbHelper.getUsers();
  let user = users.get(id);
  res.json(user);
});

router.post('/users/:id', function (req, res) {
  client.logger.log('info', 'POST - ' + req.originalUrl);
  var id = req.params.id;
  var body = req.body;
  if (body.intro !== undefined) {
    // update intro
    var intro = body.intro;
    client.dbHelper.addUserIntro(id, intro);
    res.sendStatus(200);
  } else if (body.exit !== undefined) {
    // update exit
    var exit = body.exit;
    client.dbHelper.addUserExit(id, exit);
    res.sendStatus(200);
  }
});

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
