const fs = require("fs");
const Discord = require("discord.js");
const prefix = require("../config.json").prefix;
const tools = require('./tools.js');
const cron = require('node-cron');

var currectConnectionTime = new Array();
var totalConnectionTime = new Array();
var userChatMessages = new Array();
var soundboardUsage = new Array();

var monthlyConnectionTime = new Array();
var monthlyUserChatMessages = new Array();
var monthlySoundboardUsage = new Array();


var guild;
var internalMax = 0;
const leaderboardSize = 10;

const pages = ['🗣️ Voice', '⌨️ Messages', '🔊 Soundboard'];

const currectConnectionTimeFile = "../currentConnectionFile.json";
const totalConnectionTimeFile = "../totalConnectionTimeFile.json";
const userChatMessagesFile = "../userChatMessagesFile.json";
const soundboardUsageFile = "../soundboardUsageFile.json";

const monthlyConnectionTimeFile = "../monthlyConnectionTimeFile.json";
const monthlyUserChatMessagesFile = "../monthlyUserChatMessagesFile.json";
const monthlySoundboardUsageFile = "../monthlySoundboardUsageFile.json";

var client;

module.exports = {
  listen: function(cClient) {
    client = cClient;

    loadFiles();

    //Listen for stats commands
    client.on("message", message => {
      if (message.content.charAt(0) == prefix) {
        var msg = message.content.substring(1);

        splitCommands = msg.split(" ");

        if (splitCommands[0] == "stats") {

          var totalVoice = 0;
          var monthlyVoice = 0;
          var totalMessages = 0;
          var monthlyMessages = 0;
          var totalVoiceRank = 0;
          var monthlyVoiceRank = 0;
          var totalMessagesRank = 0;
          var monthlyMessagesRank = 0;

          totalVoiceRank = getAllTimeVoiceRank(message.member.id);
          monthlyVoiceRank = getMonthlyVoiceRank(message.member.id);
          totalMessagesRank = getAllTimeMessagesRank(message.member.id);
          monthlyMessagesRank = getMonthlyMessagesRank(message.member.id);

          var currentConnectedTime = 0;
          currectConnectionTime.forEach((item, i) => {
            if (item.userid === message.member.id) {
              var date = new Date();
              var currentTime = date.getTime();
              currentConnectedTime = currentTime - item.joinTime;
            }
          });

          totalConnectionTime.forEach((item, i) => {
            if(item.userid == message.author.id){
              var totalConnectionTime = parseInt(currentConnectedTime) + parseInt(item.totalTime);
              totalVoice = parseMillisecondsIntoReadableTime(totalConnectionTime)
            }
          });

          monthlyConnectionTime.forEach((item, i) => {
            if(item.userid == message.author.id){
              var totalConnectionTime = parseInt(currentConnectedTime) + parseInt(item.totalTime);
              monthlyVoice = parseMillisecondsIntoReadableTime(totalConnectionTime)
            }
          });

          userChatMessages.forEach((item, i) => {
            if(item.userid == message.author.id){
              totalMessages = item.messages;
            }
          });

          monthlyUserChatMessages.forEach((item, i) => {
            if(item.userid == message.author.id){
              monthlyMessages = item.messages;
            }
          });

          var embed = new Discord.MessageEmbed()
          .setTitle('Stats')
          .setAuthor(message.member.displayName, message.author.displayAvatarURL())
          .setColor("#0099ff")

          var data = new Map();
          var row1 = new Array();
          var row2 = new Array();

          var date = new Date();
          var month =  getMonthName(date.getMonth());

          row1.push('Pos');
          row2.push('Time');
          row1.push(totalVoiceRank.toString());
          row2.push(totalVoice.toString());
          row1.push('');
          row2.push('');
          row1.push(month+' Voice');
          row2.push('')
          row1.push('Pos');
          row2.push('Time');
          row1.push(monthlyVoiceRank.toString());
          row2.push(monthlyVoice.toString());
          row1.push('');
          row2.push('');
          row1.push('All-time Messages');
          row2.push('')
          row1.push('Pos');
          row2.push('Messages');
          row1.push(totalMessagesRank.toString());
          row2.push(totalMessages.toString());
          row1.push('');
          row2.push('');
          row1.push(month+' Messages');
          row2.push('')
          row1.push('Pos');
          row2.push('Messages');
          row1.push(monthlyMessagesRank.toString());
          row2.push(monthlyMessages.toString());

          data.set('All-time Voice',row1);
          data.set('',row2);

          embed.setDescription(tools.generateTable(data));

          message.reply(embed);

        } else if (splitCommands[0] == "leaderboard") {

          guild = message.guild;

          var monthlyLeaderboardEmbeds = generateLeaderboardEmbeds(false);
          var lifetimeLeaderboardEmbeds = generateLeaderboardEmbeds(true);

          var leaderboardEmbeds = monthlyLeaderboardEmbeds;

          message.channel.send(leaderboardEmbeds.get(0)[0]).then((msg)=>{
            var page = 0;
            var internalPage = 0;

            msg.react('📆');
            msg.react('♾️');
            msg.react('⬇');
            msg.react('⬆');
            msg.react('🗣️');
            msg.react('⌨️');
            msg.react('🔊');


            const filter = (reaction, user) => {
              return ['⬇','⬆','🗣️','⌨️','🔊','📆','♾️'].includes(reaction.emoji.name) && !user.bot && user.id === message.author.id;
            };

            const collector = msg.createReactionCollector(filter, { time: 60000 });
            collector.on('collect', (reaction,user) =>{
              reaction.users.remove(user);
              if(reaction.emoji.name === '⬇'){
                //scroll down current page
                if(internalPage < Math.ceil(leaderboardEmbeds.get(page).length)-1){
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
              else if(reaction.emoji.name === '🗣️'){
                page = 0;
                internalPage = 0;
                msg.edit(leaderboardEmbeds.get(page)[internalPage]);
              }
              else if(reaction.emoji.name === '⌨️'){
                page = 1;
                internalPage = 0;
                msg.edit(leaderboardEmbeds.get(page)[internalPage]);
              }
              else if(reaction.emoji.name === '🔊'){
                page = 2;
                internalPage = 0;
                msg.edit(leaderboardEmbeds.get(page)[internalPage]);
              }
              else if(reaction.emoji.name === '📆'){
                internalPage = 0;
                leaderboardEmbeds = monthlyLeaderboardEmbeds;
                msg.edit(leaderboardEmbeds.get(page)[internalPage]);
              }
              else if(reaction.emoji.name === '♾️'){
                internalPage = 0;
                leaderboardEmbeds = lifetimeLeaderboardEmbeds;
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

            currectConnectionTime.splice(i, 1);
            saveCurrentConnectionFile();
          }
        }
      }
    });

    //Listen for chat messages to be recorded as stats
    client.on("message", message => {
      if(!message.author.bot && message.content.charAt(0) != prefix){
        var monthlyUpdated = false;
        for (let i = 0; i < monthlyUserChatMessages.length; i++) {
          if(monthlyUserChatMessages[i].userid === message.author.id){
            monthlyUserChatMessages[i].messages += 1;
            monthlyUpdated = true;
          }
        }
        var totalUpdated = false;
        for (let i = 0; i < userChatMessages.length; i++) {
          if(userChatMessages[i].userid === message.author.id){
            userChatMessages[i].messages += 1;
            totalUpdated = true;
          }
        }
        if(!totalUpdated){
          var user = { userid: message.author.id, messages: 1 };
          userChatMessages.push(user);
        }
        if(!monthlyUpdated){
          var user = { userid: message.author.id, messages: 1 };
          monthlyUserChatMessages.push(user);
        }
        saveMonthlyUserChatMessagesFile();
        saveUserChatMessagesFile();
      }
    });
  },
  destroy: function() {
    saveTotalConnectionTimeFile();
    saveCurrentConnectionFile();
    saveUserChatMessagesFile();
    saveMonthlyConnectionTimeFile();
    saveMonthlyUserChatMessagesFile();
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

function loadFiles(){
  //load current connection time
  if (fs.existsSync(currectConnectionTimeFile)) {
    var rawdata = fs.readFileSync(currectConnectionTimeFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      currectConnectionTime = JSON.parse(rawdata);
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

  //load total user chat messages
  if (fs.existsSync(userChatMessagesFile)) {
    var rawdata = fs.readFileSync(userChatMessagesFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      userChatMessages = JSON.parse(rawdata);
    }
  }

  //load monthly user chat messages
  if (fs.existsSync(monthlyUserChatMessagesFile)) {
    var rawdata = fs.readFileSync(monthlyUserChatMessagesFile, function(
      err,
      data
    ) {});

    if (rawdata != null) {
      monthlyUserChatMessages = JSON.parse(rawdata);
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

function saveUserChatMessagesFile(){
  fs.writeFileSync(
    userChatMessagesFile,
    JSON.stringify(userChatMessages),
    function(err) {
      if (err) throw err;
    }
  );
}

function saveMonthlyUserChatMessagesFile(){
  fs.writeFileSync(
    monthlyUserChatMessagesFile,
    JSON.stringify(monthlyUserChatMessages),
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
    currectConnectionTimeFile,
    JSON.stringify(currectConnectionTime),
    function(err) {
      if (err) throw err;
    }
  );
}

function getVoiceEmbedFooter(internalPage,lifetime){
  var totalSize = monthlyConnectionTime.length;
  if(lifetime){
    totalSize = totalConnectionTime.length
  }
  internalMax = totalSize;
  var current = (internalPage +1);
  return current + "/" + Math.ceil(totalSize/leaderboardSize);
}

function setVoiceEmbedField(internalPage,embed,lifetime){
  var leaderboardLength = 10;
  var leaderboardArray = new Array();

  if(lifetime){
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
  }
  else{
    monthlyConnectionTime.forEach(obj => {
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
  }

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

  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;

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
    if (i >= start && i< end) {
      posData.push((i + 1).toString());
      namesData.push(userName);
      timesData.push(readableTotalConnectionTime);
    }
  }

  data.set('#',posData);
  data.set('Name',namesData);
  data.set('Time',timesData);

  embed.setDescription(tools.generateTable(data));
}

function getMessagesEmbedFooter(internalPage,lifetime){
  var totalSize = monthlyUserChatMessages.length;
  if(lifetime){
    totalSize = userChatMessages.length;
  }
  internalMax = totalSize;
  var current = (internalPage +1);
  return current + "/" + Math.ceil(totalSize/leaderboardSize);
}

function setMessagesEmbedField(internalPage,embed,lifetime){
  var leaderboardLength = 10;
  var leaderboardArray;
  if(lifetime){
    leaderboardArray = userChatMessages;
  }
  else{
    leaderboardArray = monthlyUserChatMessages
  }

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

    if (i >= start && i< end) {
      posData.push((i + 1).toString());
      namesData.push(userName);
      messagesData.push(leaderboardArray[i].messages);
    }
  }
  data.set('#',posData);
  data.set('Name',namesData);
  data.set('Messages',messagesData);

  embed.setDescription(tools.generateTable(data));
}

function getSoundboardEmbedFooter(internalPage,lifetime){
  var totalSize = monthlySoundboardUsage.length;
  if(lifetime){
    totalSize = soundboardUsage.length;
  }
  internalMax = totalSize;
  var current = (internalPage +1);
  return current + "/" + Math.ceil(totalSize/leaderboardSize);
}

function setSoundboardEmbedField(internalPage,embed,lifetime){
  var leaderboardLength = 10;
  var leaderboardArray = monthlySoundboardUsage;
  if(lifetime){
    leaderboardArray = soundboardUsage;
  }

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

  var data = new Map();
  var posData = new Array();
  var namesData = new Array();
  var playsData = new Array();

  for (let i = 0; i < leaderboardArray.length; i++) {

    if (i >= start && i< end) {
      posData.push((i + 1).toString());
      namesData.push(leaderboardArray[i].command);
      playsData.push(leaderboardArray[i].uses);
    }
  }
  data.set('#',posData);
  data.set('Name',namesData);
  data.set('Plays',playsData);

  embed.setDescription(tools.generateTable(data));
}

function generateLeaderboardEmbeds(lifetime){

  var leaderboardEmbeds = new Map();
  var date = new Date();

  var time =  getMonthName(date.getMonth());
  if(lifetime){
    time = 'All-time'
  }

  pages.forEach((item, i) => {

    var title = pages[i];
    if(title === "🗣️ Voice"){
      //loop through each internal page
      var voiceLeaderboardEmbeds = new Array();
      for (var o = 0; o < Math.ceil(totalConnectionTime.length/leaderboardSize); o++) {
        var embed = new Discord.MessageEmbed()
        .setTitle(title +' '+'Leaderboard')
        .setColor("#0099ff")
        setVoiceEmbedField(o,embed,lifetime);
        embed.setFooter(time + " - "+ getVoiceEmbedFooter(o,lifetime));
        voiceLeaderboardEmbeds.push(embed);
      }
      leaderboardEmbeds.set(i,voiceLeaderboardEmbeds);

    }else if(title === "⌨️ Messages"){
      //loop through each internal page
      var messagesLeaderboardEmbeds = new Array();
      for (var o = 0; o < Math.ceil(userChatMessages.length/leaderboardSize); o++) {
        var embed = new Discord.MessageEmbed()
        .setTitle(title +' '+'Leaderboard')
        .setColor("#0099ff")
        setMessagesEmbedField(o,embed,lifetime);
        embed.setFooter(time + " - "+ getMessagesEmbedFooter(o,lifetime));
        messagesLeaderboardEmbeds.push(embed);
      }
      leaderboardEmbeds.set(i,messagesLeaderboardEmbeds);

    }else if (title === "🔊 Soundboard") {
      //loop through each internal page
      var soundboardLeaderboardEmbeds = new Array();
      for (var o = 0; o < Math.ceil(soundboardUsage.length/leaderboardSize); o++) {
        var embed = new Discord.MessageEmbed()
        .setTitle(title +' '+'Leaderboard')
        .setColor("#0099ff")
        setSoundboardEmbedField(o,embed,lifetime);
        embed.setFooter(time + " - "+ getSoundboardEmbedFooter(o,lifetime));
        soundboardLeaderboardEmbeds.push(embed);
      }
      leaderboardEmbeds.set(i,soundboardLeaderboardEmbeds);
    }

  });

  return leaderboardEmbeds;
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
  .setDescription(generateMonthlyMessagesLeaderboard());

  channel.send(embed).then((msg)=>{
    // msg.pin();
  });

  //reset leaderboard
  monthlyConnectionTime = new Array();
  monthlyUserChatMessages = new Array();
  monthlySoundboardUsage = new Array();
  saveMonthlyConnectionTimeFile();
  saveMonthlyUserChatMessagesFile();
  saveMonthlySoundboardUsageFile();
});

function getMonthName(monthNumber) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months.slice(monthNumber)[0];
}

function generateMonthlyMessagesLeaderboard(){
  var leaderboardArray = monthlyUserChatMessages;

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

function getAllTimeVoiceRank(userid){
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

  for (var i = 0; i < leaderboardArray.length; i++) {
    if(leaderboardArray[i].userid == userid){
      return "#"+(i+1);
    }
  }

  return "#"+0;
}

function getMonthlyVoiceRank(userid){
  var leaderboardArray = new Array();

  monthlyConnectionTime.forEach(obj => {
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

  for (var i = 0; i < leaderboardArray.length; i++) {
    if(leaderboardArray[i].userid == userid){
      return "#"+(i+1);
    }
  }

  return "#"+0;
}

function getAllTimeMessagesRank(userid){
  var leaderboardArray = new Array();

  leaderboardArray = userChatMessages;

  //sort array by length
  leaderboardArray.sort(function(a, b) {
    if (a.messages > b.messages) {
      return -1;
    }
    if (a.messages < b.messages) {
      return 1;
    }
    return 0;
  });

  for (var i = 0; i < leaderboardArray.length; i++) {
    if(leaderboardArray[i].userid == userid){
      return "#"+(i+1);
    }
  }

  return "#"+0;
}

function getMonthlyMessagesRank(userid){
  var leaderboardArray = new Array();

  leaderboardArray = monthlyUserChatMessages;

  //sort array by length
  leaderboardArray.sort(function(a, b) {
    if (a.messages > b.messages) {
      return -1;
    }
    if (a.messages < b.messages) {
      return 1;
    }
    return 0;
  });

  for (var i = 0; i < leaderboardArray.length; i++) {
    if(leaderboardArray[i].userid == userid){
      return "#"+(i+1);
    }
  }

  return "#"+0;
}
