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
        // res.download(soundCommand.file);

        var file = soundCommand.file;
        var data = fs.readFileSync(file);
        res.json({sound: data.toString('base64')});
      }
    });
  });
});

/* GET user by ID. */
// router.get('/soundcommands/:id', function (req, res, next) {
//   const id = parseInt(req.params.id);
//   if (id >= 0 && id < users.length) {
//     res.json(users[id]);
//   } else {
//     res.sendStatus(404);
//   }
// });

module.exports = {
  router,
  init: async function (discordClient) {
    client = discordClient;
  }
};
