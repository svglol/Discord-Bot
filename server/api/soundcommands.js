'use strict';

var _express = require('express');

var router = _express.Router();

var client;

/* GET soundcommands listing. */
router.get('/soundcommands', function (req, res, next) {
  client.getDbHelper().getSoundCommands().then(value => {
    res.json(value);
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
