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
  loadSoundCommands: function(soundCommands,adminSoundCommands,newSoundCommands){
    fs.readdirSync(soundFolder).forEach(file => {
      var sound = {file:'./resources/sound/'+file, command:createCommand(file)};
      soundCommands.push(sound);

      var date = new Date();
      var modTime = fs.statSync(soundFolder + '/' + file).mtime.getTime();

      var diff = Math.abs(modTime - date.getTime());
      var days = diff / (1000 * 60 * 60 * 24);
      if(days < 7){
        newSoundCommands.push(createCommand(file));
      }

    });

    fs.readdirSync(adminSoundFolder).forEach(file => {
      var sound = {file:'./resources/admin-sound/'+file, command:createCommand(file)};
      adminSoundCommands.push(sound);
    });


  },
  generateTable: function(data){
    var tableString = "";
    var rowSize = new Array();
    var numRows = 0;
    tableString = "```"
    //get longest word in each row
    data.forEach((item, i) => {
      var row = 0;
      var maxLength = 0;
      item.forEach((obj) => {
        if(obj.length > maxLength)
        maxLength = obj.length;
        row++;
      });
      rowSize.push(maxLength+2);
      numRows = row;

    });

    //create header
    var iterator = data.keys();
    for (var i = 0; i < data.size; i++) {
      var text = iterator.next().value;
      var space = "";
      for (var j = 0; j < rowSize[i]-text.length; j++) {
        space += " ";
      }
      tableString += text;
      tableString += space;
    }
    tableString += "\n";

    //create data

    for (var i = 0; i < numRows; i++) {
      var iterator = data.values();
      for (var j = 0; j < data.size; j++) {
        var text = iterator.next().value[i];
        var space = "";
        for (var k = 0; k < rowSize[j]-text.length; k++) {
          space += " ";
        }
        tableString += text;
        tableString += space;

      }
      tableString += "\n";

    }

    tableString += "```";
    return tableString;
  }
};

var createCommand = function(file){
  return /[^.]*/.exec(file)[0];
}
