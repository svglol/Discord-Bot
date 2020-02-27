const Sequelize = require('sequelize');
const fs = require("fs");

const userChatMessagesFile = "../userChatMessagesFile.json";
const monthlyUserChatMessagesFile = "../monthlyUserChatMessagesFile.json";
const soundboardUsageFile = "../soundboardUsageFile.json";
const monthlySoundboardUsageFile = "../monthlySoundboardUsageFile.json";
const currentConnectionTimeFile = "../currentConnectionFile.json";
const totalConnectionTimeFile = "../totalConnectionTimeFile.json";
const monthlyConnectionTimeFile = "../monthlyConnectionTimeFile.json";

module.exports = {
  init: function(client){
    client.getLogger().log('info', 'Database Initializing')
    const sequelize = new Sequelize('database', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'database.sqlite',
    })

    const User = sequelize.import('models/Users');
    const UserConnection = sequelize.import('models/UserConnection');
    const UserMessage = sequelize.import('models/UserMessage');
    const UserSoundboard = sequelize.import('models/UserSoundboard');

    const force = process.argv.includes('--force') || process.argv.includes('-f');

    sequelize.sync({ force }).then(async () => {

      //Check if the user chat messages file exists
      if (fs.existsSync(userChatMessagesFile)) {
        var rawdata = fs.readFileSync(userChatMessagesFile, function(
          err,
          data
        ) {});

        if (rawdata != null) {
          var userChatMessages = JSON.parse(rawdata);
        }

        fs.unlinkSync(userChatMessagesFile);
        fs.unlinkSync(monthlyUserChatMessagesFile);
      }

      if (fs.existsSync(soundboardUsageFile)) {
        var rawdata = fs.readFileSync(soundboardUsageFile, function(
          err,
          data
        ) {});

        if (rawdata != null) {
          var soundboardUsage = JSON.parse(rawdata);
        }

        fs.unlinkSync(soundboardUsageFile);
        fs.unlinkSync(monthlySoundboardUsageFile);
      }

      if (fs.existsSync(totalConnectionTimeFile)) {
        var rawdata = fs.readFileSync(totalConnectionTimeFile, function(
          err,
          data
        ) {});

        if (rawdata != null) {
          var connectionTime = JSON.parse(rawdata);
        }

        fs.unlinkSync(totalConnectionTimeFile);
        fs.unlinkSync(monthlyConnectionTimeFile);
        fs.unlinkSync(currentConnectionTimeFile);
      }

      if(connectionTime != null){
        client.getLogger().log('info', 'Transferring Connection Time File')
        connectionTime.forEach(async (item, i) => {
          await User.upsert({ user_id: item.userid, last_connection: ''});
          await UserConnection.upsert({user_id: item.userid,connectTime:0,disconnectTime:0,connectionLength:item.totalTime})
        });
      }

      if(soundboardUsage != null){
        client.getLogger().log('info', 'Transferring Sounboard Usage File')
        soundboardUsage.forEach(async (item, i) => {
          for (var i = 0; i < item.uses; i++) {
            await UserSoundboard.upsert({ user_id: '0',date:'0',command:item.command});
          }
        });
      }

      if(userChatMessages != null){
        client.getLogger().log('info', 'Transferring User Chat Messages File')
        userChatMessages.forEach(async (item, i) => {
          await User.upsert({ user_id: item.userid, last_connection: ''});
          for (var i = 0; i < item.messages; i++) {
            await UserMessage.upsert({user_id: item.userid,date: '0'})
          }
        });
      }

      if(soundboardUsage == null && userChatMessages == null && connectionTime == null){
        sequelize.close();
      }
      client.getLogger().log('info', 'Database Initialized')
      //
    }).catch(console.error);
  }
};
