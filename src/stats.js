const fs = require("fs");
const Discord = require("discord.js");
const prefix = require("../config.json").prefix;

var currectConnectionTime = new Array();
var totalConnectionTime = new Array();
var userChatMessages = new Array();
var soundboardUsage = new Array();

var guild;
var internalMax = 0;
const leaderboardSize = 10;

const pages = ['Voice', 'Messages', 'Soundboard'];

const currectConnectionTimeFile = "../currentConnectionFile.json";
const totalConnectionTimeFile = "../totalConnectionTimeFile.json";
const userChatMessagesFile = "../userChatMessagesFile.json";
const soundboardUsageFile = "../soundboardUsageFile.json";

module.exports = {
  listen: function(client) {
    loadCurrentConnectionFile();
    loadTotalConnectionTimeFile();
    loadUserChatMessagesFile();
    loadSoundboardUsageFile();
    //Listen for stats commands
    client.on("message", message => {
      if (message.content.charAt(0) == prefix) {
        var msg = message.content.substring(1);

        splitCommands = msg.split(" ");

        if (splitCommands[0] == "stats") {
          if (splitCommands[1] == "current") {
            var messageSent = false;
            currectConnectionTime.forEach(obj => {
              if (obj.userid === message.member.id) {
                connectionLength = getReadableConnectedTime(obj.joinTime);
                message.reply(
                  "You have been connected to this session for " +
                  connectionLength
                );
                messageSent = true;
              }
            });
            if(!messageSent) message.reply("Your arent connected");
          } else if (splitCommands[1] == "total") {
            totalConnectionTime.forEach(obj => {
              if (obj.userid === message.member.id) {
                var currentConnectedTime = 0;
                currectConnectionTime.forEach(currentObj => {
                  if (currentObj.userid === obj.userid) {
                    var date = new Date();
                    var currentTime = date.getTime();
                    currentConnectedTime = currentTime - currentObj.joinTime;
                  }
                });
                var totalConnectionTime =
                parseInt(currentConnectedTime) + parseInt(obj.totalTime);
                var readableTotalConnectionTime = parseMillisecondsIntoReadableTime(
                  totalConnectionTime
                );

                message.reply(
                  "You have been connected for a total of " +
                  readableTotalConnectionTime
                );
              }
            });
          } else if (splitCommands[1] == "leaderboard") {
            const leaderboardEmbed = new Discord.MessageEmbed()
            .setTitle("Voice Leaderboard")
            .setColor("#0099ff");

            guild = message.guild;
            leaderboardEmbed.setFooter(getVoiceEmbedFooter(0));
            leaderboardEmbed.setDescription(getVoiceEmbedDescription(0));
            message.channel.send(leaderboardEmbed).then((msg)=>{
              var page = 0;
              var internalPage = 0;

              msg.react('⬇');
              msg.react('⬆');
              msg.react('⬅');
              msg.react('➡');

              const filter = (reaction, user) => {
                return ['⬅', '➡','⬇','⬆'].includes(reaction.emoji.name) && !user.bot && user.id === message.author.id;
              };

              var leaderboardEmbeds = generateLeaderboardEmbeds();

              const collector = msg.createReactionCollector(filter, { time: 60000 });
              collector.on('collect', (reaction,user) =>{
                reaction.users.remove(user);
                if(reaction.emoji.name === '⬅'){
                  //go back a page
                  if(page != 0){
                    page--;
                  }
                  internalPage = 0;
                  msg.edit(leaderboardEmbeds.get(page)[internalPage]);
                }
                else if (reaction.emoji.name === '➡') {
                  //go to next page
                  if(page != pages.length-1){
                    page++;
                  }
                  internalPage = 0;
                  msg.edit(leaderboardEmbeds.get(page)[internalPage]);
                }
                else if(reaction.emoji.name === '⬇'){
                  //scroll down current page
                  if(internalPage < Math.ceil(internalMax/leaderboardSize)-1){
                    internalPage++;
                  }
                  msg.edit(leaderboardEmbeds.get(page)[internalPage]);
                }
                else if(reaction.emoji.name === '⬆'){
                  //scroll up current page
                  if(internalPage != 0){
                    internalPage--;
                  }
                  msg.edit(leaderboardEmbeds.get(page)[internalPage]);
                }
              });
              collector.on('end', collection =>{
                //remove reactions once reaction collector has ended
                msg.reactions.removeAll();
              })
            });
          }
        }
      }
    });

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

          currectConnectionTime.push(connectingUser);
          saveCurrentConnectionFile();
        }
      }
      //User leaves server
      else if (newUserChannel === null || newUserChannel === afkChannel) {
        for (let i = 0; i < currectConnectionTime.length; i++) {
          if (currectConnectionTime[i].userid === newMember.id) {
            var date = new Date();
            var currentTime = date.getTime();
            var connectedTime = currentTime - currectConnectionTime[i].joinTime;
            var user = { userid: newMember.id, totalTime: connectedTime };
            var updated = false;
            totalConnectionTime.forEach(obj => {
              if (obj.userid === newMember.id) {
                obj.totalTime += connectedTime;
                updated = true;
              }
            });
            if (!updated) {
              totalConnectionTime.push(user);
            }
            saveTotalConnectionTimeFile();

            currectConnectionTime.splice(i, 1);
            saveCurrentConnectionFile();
          }
        }
      }
    });

    //Listen for chat messages to be recorded as stats
    client.on("message", message => {
      if(!message.author.bot && message.content.charAt(0) != prefix){
        var updated = false;
        for (let i = 0; i < userChatMessages.length; i++) {
          if(userChatMessages[i].userid === message.author.id){
            userChatMessages[i].messages += 1;
            updated = true;
          }
        }
        if(!updated){
          var user = { userid: message.author.id, messages: 1 };
          userChatMessages.push(user);
        }
        saveUserChatMessagesFile();
      }
    });
  },
  destroy: function() {
    saveTotalConnectionTimeFile();
    saveCurrentConnectionFile();
    saveUserChatMessagesFile();
  },
  addSoundBoardUse: function(sound){
    var updated = false;
    for (let i = 0; i < soundboardUsage.length; i++) {
      if(soundboardUsage[i].command === sound){
        soundboardUsage[i].uses += 1;
        updated = true;
      }
    }
    if(!updated){
      var soundUse = { command: sound, uses: 1 };
      soundboardUsage.push(soundUse);
    }
    saveSoundboardUsageFile();
  }
};

function getReadableConnectedTime(joinTime) {
  var date = new Date();
  var currentTime = date.getTime();

  var millisec = currentTime - joinTime;
  return parseMillisecondsIntoReadableTime(millisec);
}

function parseMillisecondsIntoReadableTime(millisec) {
  var seconds = (millisec / 1000).toFixed(0);
  var minutes = Math.floor(seconds / 60);
  var hours = "";
  if (minutes > 59) {
    hours = Math.floor(minutes / 60);
    hours = hours >= 10 ? hours : "0" + hours;
    minutes = minutes - hours * 60;
    minutes = minutes >= 10 ? minutes : "0" + minutes;
  }

  seconds = Math.floor(seconds % 60);
  seconds = seconds >= 10 ? seconds : "0" + seconds;
  if (hours != "") {
    return hours + ":" + minutes + ":" + seconds;
  }
  return minutes + ":" + seconds;
}

function loadCurrentConnectionFile() {
  if (fs.existsSync(currectConnectionTimeFile)) {
    var rawdata = fs.readFileSync(currectConnectionTimeFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      currectConnectionTime = JSON.parse(rawdata);
    }
  }
}

function loadTotalConnectionTimeFile() {
  if (fs.existsSync(totalConnectionTimeFile)) {
    var rawdata = fs.readFileSync(totalConnectionTimeFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      totalConnectionTime = JSON.parse(rawdata);
    }
  }
}

function loadUserChatMessagesFile(){
  if (fs.existsSync(userChatMessagesFile)) {
    var rawdata = fs.readFileSync(userChatMessagesFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      userChatMessages = JSON.parse(rawdata);
    }
  }
}

function loadSoundboardUsageFile(){
  if (fs.existsSync(soundboardUsageFile)) {
    var rawdata = fs.readFileSync(soundboardUsageFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      soundboardUsage = JSON.parse(rawdata);
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

function saveUserChatMessagesFile(){
  fs.writeFileSync(
    userChatMessagesFile,
    JSON.stringify(userChatMessages),
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
    currectConnectionTimeFile,
    JSON.stringify(currectConnectionTime),
    function(err) {
      if (err) throw err;
    }
  );
}

function getVoiceEmbedFooter(internalPage){
  var totalSize = totalConnectionTime.length;
  internalMax = totalSize;
  var current = (internalPage +1);
  return current + "/" + Math.ceil(totalSize/leaderboardSize);
}

function getVoiceEmbedDescription(internalPage){
  var leaderboardLength = 10;
  var leaderboardArray = new Array();

  totalConnectionTime.forEach(obj => {
    var currentConnectedTime = 0;
    currectConnectionTime.forEach(currentObj => {
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

  var leaderboardMessage = "";
  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;
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
    if (i >= start && i< end) {
      leaderboardMessage += "```";
      leaderboardMessage +=
      "#" +
      (i + 1) +
      " " +
      userName +
      " " +
      readableTotalConnectionTime;
      leaderboardMessage += "```";
    }
  }

  return leaderboardMessage;
}

function getMessagesEmbedFooter(internalPage){
  var totalSize = userChatMessages.length;
  internalMax = totalSize;
  var current = (internalPage +1);
  return current + "/" + Math.ceil(totalSize/leaderboardSize);
}

function getMessagesEmbedDescription(internalPage){
  var messagesDescription = "";
  var leaderboardLength = 10;
  var leaderboardArray = userChatMessages;

  leaderboardArray.sort(function(a, b) {
    if (a.messages > b.messages) {
      return -1;
    }
    if (a.messages < b.messages) {
      return 1;
    }
    return 0;
  });

  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;

  for (let i = 0; i < leaderboardArray.length; i++) {
    var userName = "";
    try {
      userName = guild.member(leaderboardArray[i].userid)
      .displayName;
    } catch (e) {
      console.log(e);
    }

    if (i >= start && i< end) {
      messagesDescription += "```";
      messagesDescription +=
      "#" +
      (i + 1) +
      " " +
      userName +
      " " +
      leaderboardArray[i].messages;
      messagesDescription += "```";
    }
  }

  return messagesDescription;
}

function getSoundboardEmbedFooter(internalPage){
  var totalSize = soundboardUsage.length;
  internalMax = totalSize;
  var current = (internalPage +1);
  return current + "/" + Math.ceil(totalSize/leaderboardSize);
}

function getSoundboardEmbedDescription(internalPage){
  var soundboardDescription = "";
  var leaderboardLength = 10;
  var leaderboardArray = soundboardUsage;

  leaderboardArray.sort(function(a, b) {
    if (a.uses > b.uses) {
      return -1;
    }
    if (a.uses < b.uses) {
      return 1;
    }
    return 0;
  });

  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;

  for (let i = 0; i < leaderboardArray.length; i++) {

    if (i >= start && i< end) {
      soundboardDescription += "```";
      soundboardDescription +=
      "#" +
      (i + 1) +
      " " +
      leaderboardArray[i].command +
      " " +
      leaderboardArray[i].uses;
      soundboardDescription += "```";
    }
  }

  return soundboardDescription;
}

function generateLeaderboardEmbeds(){

  var leaderboardEmbeds = new Map();

  pages.forEach((item, i) => {

    var title = pages[i];
    if(title === "Voice"){
      //loop through each internal page
      var voiceLeaderboardEmbeds = new Array();
      for (var o = 0; o < Math.ceil(totalConnectionTime.length/leaderboardSize); o++) {
        var embed = new Discord.MessageEmbed()
        .setTitle(title +' '+'Leaderboard')
        .setColor("#0099ff");
        embed.setDescription(getVoiceEmbedDescription(o));
        embed.setFooter(getVoiceEmbedFooter(o));
        voiceLeaderboardEmbeds.push(embed);
      }
      leaderboardEmbeds.set(i,voiceLeaderboardEmbeds);

    }else if(title === "Messages"){
      //loop through each internal page
      var messagesLeaderboardEmbeds = new Array();
      for (var o = 0; o < Math.ceil(userChatMessages.length/leaderboardSize); o++) {
        var embed = new Discord.MessageEmbed()
        .setTitle(title +' '+'Leaderboard')
        .setColor("#0099ff");
        embed.setDescription(getMessagesEmbedDescription(o));
        embed.setFooter(getMessagesEmbedFooter(o));
        messagesLeaderboardEmbeds.push(embed);
      }
      leaderboardEmbeds.set(i,messagesLeaderboardEmbeds);

    }else if (title === "Soundboard") {
      //loop through each internal page
      var soundboardLeaderboardEmbeds = new Array();
      for (var o = 0; o < Math.ceil(soundboardUsage.length/leaderboardSize); o++) {
        var embed = new Discord.MessageEmbed()
        .setTitle(title +' '+'Leaderboard')
        .setColor("#0099ff");
        embed.setDescription(getSoundboardEmbedDescription(o));
        embed.setFooter(getSoundboardEmbedFooter(o));
        soundboardLeaderboardEmbeds.push(embed);
      }
      leaderboardEmbeds.set(i,soundboardLeaderboardEmbeds);
    }

  });

  return leaderboardEmbeds;
}
