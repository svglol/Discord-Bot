const fs = require('fs');
const soundFolder = './resources/sound/';
const adminSoundFolder = './resources/admin-sound/';

module.exports = {
  sort: function (sound, commands) {
    sound.sort(function(a, b){
      if(a.command < b.command) { return -1; }
      if(a.command > b.command) { return 1; }
      return 0;
    })

    commands.sort(function(a, b){
      if(a.command < b.command) { return -1; }
      if(a.command > b.command) { return 1; }
      return 0;
    })
  },
  loadSoundCommands: function(soundCommands,adminSoundCommands){
    fs.readdirSync(soundFolder).forEach(file => {
      var sound = {file:'./resources/sound/'+file, command:createCommand(file)};
      soundCommands.push(sound);
    });

    fs.readdirSync(adminSoundFolder).forEach(file => {
      var sound = {file:'./resources/admin-sound/'+file, command:createCommand(file)};
      adminSoundCommands.push(sound);
    });
  }
};

var createCommand = function(file){
  return /[^.]*/.exec(file)[0];
}
