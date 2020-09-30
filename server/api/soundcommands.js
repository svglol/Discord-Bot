'use strict';

var _express = require('express');

var router = _express.Router();

var fs = require('fs');

const fileUpload = require('express-fileupload');

router.use(fileUpload());

class SoundCommands {
  constructor (client) {
    this.router = router;

    /* GET soundcommands listing. */
    router.get('/soundcommands', function (req, res, next) {
      client.dbHelper.getSoundCommands().then(value => {
        client.logger.log('info', 'GET - ' + req.originalUrl);
        value.forEach((item, i) => {
          let fileExists = false;
          try {
            if (fs.existsSync(item.file)) {
              fileExists = true;
            }
          } catch (err) {
            console.error(err);
          }
          item.dataValues.fileExists = fileExists;
        });
        res.json(value);
      });
    });

    // Get sound file by ID
    router.get('/soundcommands/file/:id', function (req, res, next) {
      client.logger.log('info', 'GET - ' + req.originalUrl);
      var id = req.params.id;
      client.dbHelper.getSoundCommands().then(value => {
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
      client.logger.log('info', 'DELETE - ' + req.originalUrl);
      let commandName = req.params.commandName;
      var cmd = client.commands.get(commandName);
      fs.unlinkSync(cmd.file);
      client.dbHelper.deleteSoundCommand(commandName);
      client.commands.delete(commandName);
      res.sendStatus(200);
    });

    // update sound command
    router.post('/soundcommands/:id', function (req, res) {
      client.logger.log('info', 'POST - ' + req.originalUrl + ' - ' + JSON.stringify(req.body));
      let path = './resources/sound/' + req.body.command + '.wav';
      if (req.files) {
        let file = req.files.file;
        file.mv(path, function (err) {
          if (err) { return res.status(500).send(err); }
        });
      }

      client.dbHelper.getSoundCommands().then(result => {
        result.forEach((item, i) => {
          if (item.dataValues.id === parseInt(req.body.id)) {
            if (item.dataValues.commandName !== req.body.command) {
              // move file
              fs.rename(item.dataValues.file, path, function (err) {
                if (err) throw err;
              });
            }
            client.dbHelper.editSoundCommand(req.body.id, req.body.command, path, req.body.volume);
            client.commands.delete(item.dataValues.command);
            client.commandsLoader.addSoundCommand(client, req.body.command, path, req.body.volume, new Date().getTime());
            res.sendStatus(200);
          }
        });
      });
    });

    // add sound command
    router.put('/soundcommands/', function (req, res) {
      client.logger.log('info', 'PUT - ' + req.originalUrl + ' - ' + JSON.stringify(req.body));

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.sendStatus(400);
      }

      let file = req.files.file;
      let path = './resources/sound/' + req.body.command + '.wav';
      if (!fs.existsSync(path)) {
        file.mv(path, function (err) {
          if (err) { return res.status(500).send(err); }
          client.dbHelper.addSoundCommand(req.body.command, path, req.body.volume, new Date().getTime()).then((result) => {
            res.json({id: result.dataValues.id, command: result.dataValues.command, file: path, volume: result.dataValues.volume, date: result.dataValues.date});
          });
          client.commandsLoader.addSoundCommand(client, req.body.command, path, req.body.volume, new Date().getTime());
        });
      } else {
        res.sendStatus(500);
      }
    });
  }
}

module.exports = SoundCommands;
