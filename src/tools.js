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
  createCommand: function(file){
    return /[^.]*/.exec(file)[0];
  }
};
