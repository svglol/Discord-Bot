'use strict';

var express = require('express');

var Users = require('./users');
var SoundCommands = require('./soundcommands');
var GifCommands = require('./gifcommands');
var Discord = require('./discord');
var Bot = require('./bot');

var router = express.Router();
router.use(express.json());

class Api {
  constructor (client) {
    this.router = router;

    // Add Routes
    router.use(new Users(client).router);
    router.use(new SoundCommands(client).router);
    router.use(new GifCommands(client).router);
    router.use(new Discord(client).router);
    router.use(new Bot(client).router);
  }
}

module.exports = Api;
