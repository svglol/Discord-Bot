const Sequelize = require('sequelize');
const fs = require("fs");

const userChatMessagesFile = "../userChatMessagesFile.json";
const monthlyUserChatMessagesFile = "../monthlyUserChatMessagesFile.json";

module.exports = {
  init: function(){
    console.log('Database Initialized');
    const sequelize = new Sequelize('database', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: console.log(),
      storage: 'database.sqlite',
    })

    const User = sequelize.import('models/Users');
    const UserConnection = sequelize.import('models/UserConnection');
    const UserMessage = sequelize.import('models/UserMessage');
    const UserSoundboard = sequelize.import('models/UserSoundboard');

    const force = process.argv.includes('--force') || process.argv.includes('-f');

    sequelize.sync({ force }).then(async () => {

      //TODO sync old files into DB then delete them

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

      if(userChatMessages != null){
        userChatMessages.forEach(async (item, i) => {
          await User.upsert({ user_id: item.userid});
          for (var i = 0; i < item.messages; i++) {
            await UserMessage.upsert({user_id: item.userid,date: '0'})
          }
        });
      }
      else{
        sequelize.close();
      }


      //
    }).catch(console.error);
  }
};
