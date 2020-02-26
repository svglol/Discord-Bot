const Sequelize = require('sequelize');

module.exports = {
  init: function(){
    console.log('Init DB');
    const sequelize = new Sequelize('database', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: console.log(),
      storage: 'database.sqlite',
    })

    sequelize.import('models/Users');
    sequelize.import('models/UserConnection');
    sequelize.import('models/UserMessage');
    sequelize.import('models/UserSoundboard');

    const force = process.argv.includes('--force') || process.argv.includes('-f');

    sequelize.sync({ force }).then(async () => {

      //TODO sync old files into DB then delete them

      sequelize.close();
    }).catch(console.error);
  }
};
