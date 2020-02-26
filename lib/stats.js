const fs = require("fs");
const Discord = require("discord.js");
const prefix = require("../config.json").prefix;
const tools = require('./tools.js');
const cron = require('node-cron');

var currentConnectionTime = new Array();
var totalConnectionTime = new Array();
var soundboardUsage = new Array();

var monthlyConnectionTime = new Array();
var monthlySoundboardUsage = new Array();


var guild;
var internalMax = 0;
const leaderboardSize = 10;

const pages = ['🗣️ Voice', '⌨️ Messages', '🔊 Soundboard'];

const currentConnectionTimeFile = "../currentConnectionFile.json";
const totalConnectionTimeFile = "../totalConnectionTimeFile.json";
const soundboardUsageFile = "../soundboardUsageFile.json";

const monthlyConnectionTimeFile = "../monthlyConnectionTimeFile.json";
const monthlySoundboardUsageFile = "../monthlySoundboardUsageFile.json";

var client;

module.exports = {
  listen: function(cClient) {
    client = cClient;

    loadFiles();

    //listen for client join/disconnect
    client.on("voiceStateUpdate", (oldMember, newMember) => {
      let newUserChannel = newMember.channel;
      let oldUserChannel = oldMember.channel;
      let afkChannel = newMember.guild.afkChannel;

      //User joins server
      if (
        (oldUserChannel === null && newUserChannel !== null) ||
        (oldUserChannel === afkChannel && newUserChannel !== null)
      ) {
        if (newUserChannel !== afkChannel) {
          var date = new Date();
          var currentTime = date.getTime();
          var connectingUser = { userid: newMember.id, joinTime: currentTime };

          client.getDbHelper().updateUserLastConnection(newMember.id,currentTime);

          currentConnectionTime.push(connectingUser);
          saveCurrentConnectionFile();
        }
      }
      //User leaves server
      else if (newUserChannel === null || newUserChannel === afkChannel) {
        for (let i = 0; i < currentConnectionTime.length; i++) {
          if (currentConnectionTime[i].userid === newMember.id) {
            var date = new Date();
            var currentTime = date.getTime();
            var connectedTime = currentTime - currentConnectionTime[i].joinTime;
            var user = { userid: newMember.id, totalTime: connectedTime };
            var monthlyUpdated = false;
            monthlyConnectionTime.forEach(obj => {
              if (obj.userid === newMember.id) {
                obj.totalTime += connectedTime;
                monthlyUpdated = true;
              }
            });

            var totalUpdated = false;
            totalConnectionTime.forEach(obj => {
              if (obj.userid === newMember.id) {
                obj.totalTime += connectedTime;
                totalUpdated = true;
              }
            });
            if (!totalUpdated) {
              totalConnectionTime.push(user);
            }
            if (!monthlyUpdated) {
              monthlyConnectionTime.push(user);
            }

            saveMonthlyConnectionTimeFile();
            saveTotalConnectionTimeFile();

            currentConnectionTime.splice(i, 1);
            saveCurrentConnectionFile();

            client.getDbHelper().updateUserLastConnection(newMember.id,0);
          }
        }
      }
    });

    //Listen for chat messages to be recorded as stats
    client.on("message", message => {
      if(!message.author.bot && message.content.charAt(0) != prefix){
        client.getDbHelper().addUserMessage(message);
      }
    });
  },
  addSoundBoardUse: function(sound){
    var monthlyUpdated = false;
    for (let i = 0; i < monthlySoundboardUsage.length; i++) {
      if(monthlySoundboardUsage[i].command === sound){
        monthlySoundboardUsage[i].uses += 1;
        monthlyUpdated = true;
      }
    }

    var totalUpdated = false;
    for (let i = 0; i < soundboardUsage.length; i++) {
      if(soundboardUsage[i].command === sound){
        soundboardUsage[i].uses += 1;
        totalUpdated = true;
      }
    }
    if(!totalUpdated){
      var soundUse = { command: sound, uses: 1 };
      soundboardUsage.push(soundUse);
    }

    if(!monthlyUpdated){
      var soundUse = { command: sound, uses: 1 };
      monthlySoundboardUsage.push(soundUse);
    }
    saveSoundboardUsageFile();
    saveMonthlySoundboardUsageFile();
  },
  getCurrentConnectionTime:function(){
    return currentConnectionTime;
  },
  getTotalConnectionTime:function(){
    return totalConnectionTime;
  },
  getMonthlyConnectionTime:function(){
    return monthlyConnectionTime;
  },
  getSoundboardUsage:function(){
    return soundboardUsage;
  },
  getMonthlySoundboardUsage:function(){
    return monthlySoundboardUsage;
  }

};

function loadFiles(){
  //load current connection time
  if (fs.existsSync(currentConnectionTimeFile)) {
    var rawdata = fs.readFileSync(currentConnectionTimeFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      currentConnectionTime = JSON.parse(rawdata);
    }
  }

  //load total connection time
  if (fs.existsSync(totalConnectionTimeFile)) {
    var rawdata = fs.readFileSync(totalConnectionTimeFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      totalConnectionTime = JSON.parse(rawdata);
    }
  }

  //Load monthly connection time
  if (fs.existsSync(monthlyConnectionTimeFile)) {
    var rawdata = fs.readFileSync(monthlyConnectionTimeFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      monthlyConnectionTime = JSON.parse(rawdata);
    }
  }

  //load soundboard usage
  if (fs.existsSync(soundboardUsageFile)) {
    var rawdata = fs.readFileSync(soundboardUsageFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      soundboardUsage = JSON.parse(rawdata);
    }
  }

  //load monthly soundboard usage
  if (fs.existsSync(monthlySoundboardUsageFile)) {
    var rawdata = fs.readFileSync(monthlySoundboardUsageFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      monthlySoundboardUsage = JSON.parse(rawdata);
    }
  }
}

function saveSoundboardUsageFile(){
  fs.writeFileSync(
    soundboardUsageFile,
    JSON.stringify(soundboardUsage),
    function(err) {
      if (err) throw err;
    }
  );
}

function saveMonthlySoundboardUsageFile(){
  fs.writeFileSync(
    monthlySoundboardUsageFile,
    JSON.stringify(monthlySoundboardUsage),
    function(err) {
      if (err) throw err;
    }
  );
}

function saveMonthlyConnectionTimeFile() {
  fs.writeFileSync(
    monthlyConnectionTimeFile,
    JSON.stringify(monthlyConnectionTime),
    function(err) {
      if (err) throw err;
    }
  );
}

function saveTotalConnectionTimeFile() {
  fs.writeFileSync(
    totalConnectionTimeFile,
    JSON.stringify(totalConnectionTime),
    function(err) {
      if (err) throw err;
    }
  );
}

function saveCurrentConnectionFile() {
  fs.writeFileSync(
    currentConnectionTimeFile,
    JSON.stringify(currentConnectionTime),
    function(err) {
      if (err) throw err;
    }
  );
}

// schedule reset of stats every month 0 6 1 * *
cron.schedule('0 6 1 * *', () => {
  console.log('Reset Stats');
  //generate and post final leaderboard for month
  guild = client.guilds.array()[0];
  var channel = guild.channels.find(ch => ch.name === 'general-chat');

  var date = new Date();
  channel.send("This is the final leaderboard for "+getMonthName(date.getMonth()-1))

  var embed = new Discord.MessageEmbed()
  .setTitle(":speaking_head: Voice Leaderboard")
  .setColor("#0099ff")
  .setDescription(generateMonthlyVoiceLeaderboard());

  channel.send(embed).then((msg)=>{
    // msg.pin();
  });

  var embed = new Discord.MessageEmbed()
  .setTitle("⌨️ Messages Leaderboard")
  .setColor("#0099ff")
  // .setDescription(generateMonthlyMessagesLeaderboard());

  channel.send(embed).then((msg)=>{
    // msg.pin();
  });

  //reset leaderboard
  monthlyConnectionTime = new Array();
  monthlySoundboardUsage = new Array();
  saveMonthlyConnectionTimeFile();
  saveMonthlySoundboardUsageFile();
});

function generateMonthlyMessagesLeaderboard(){
  var leaderboardArray = new Array();

  leaderboardArray.sort(function(a, b) {
    if (a.messages > b.messages) {
      return -1;
    }
    if (a.messages < b.messages) {
      return 1;
    }
    return 0;
  });

  var data = new Map();
  var posData = new Array();
  var namesData = new Array();
  var messagesData = new Array();

  for (let i = 0; i < leaderboardArray.length; i++) {
    var userName = "";
    try {
      userName = guild.member(leaderboardArray[i].userid)
      .displayName;
    } catch (e) {
      console.log(e);
    }
    posData.push((i + 1).toString());
    namesData.push(userName);
    messagesData.push(leaderboardArray[i].messages);
  }

  data.set('#',posData);
  data.set('Name',namesData);
  data.set('Messages',messagesData);
  return tools.generateTable(data);
}

function generateMonthlyVoiceLeaderboard(){
  var leaderboardArray = new Array();

  monthlyConnectionTime.forEach(obj => {
    var currentConnectedTime = 0;
    currentConnectionTime.forEach(currentObj => {
      if (currentObj.userid === obj.userid) {
        var date = new Date();
        var currentTime = date.getTime();
        currentConnectedTime = currentTime - currentObj.joinTime;
      }
    });

    var totalConnectionTime;
    if (currentConnectedTime !== 0) {
      totalConnectionTime =
      parseInt(currentConnectedTime) + parseInt(obj.totalTime);
    } else {
      totalConnectionTime = parseInt(obj.totalTime);
    }
    var user = { userid: obj.userid, totalTime: totalConnectionTime };

    leaderboardArray.push(user);
  });

  //sort array by length
  leaderboardArray.sort(function(a, b) {
    if (a.totalTime > b.totalTime) {
      return -1;
    }
    if (a.totalTime < b.totalTime) {
      return 1;
    }
    return 0;
  });

  var data = new Map();
  var posData = new Array();
  var namesData = new Array();
  var timesData = new Array();

  for (let i = 0; i < leaderboardArray.length; i++) {
    var readableTotalConnectionTime = parseMillisecondsIntoReadableTime(
      leaderboardArray[i].totalTime
    );
    var userName = "";
    try {
      userName = guild.member(leaderboardArray[i].userid)
      .displayName;
    } catch (e) {
      console.log(e);
    }
    posData.push((i + 1).toString());
    namesData.push(userName);
    timesData.push(readableTotalConnectionTime);
  }

  data.set('#',posData);
  data.set('Name',namesData);
  data.set('Time',timesData);

  return tools.generateTable(data);
}
