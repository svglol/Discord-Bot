const Discord = require('discord.js');

var totalConnectionTime = new Array();
var userChatMessages = new Array();
var soundboardUsage = new Array();

var monthlyConnectionTime = new Array();
var monthlyUserChatMessages = new Array();
var monthlySoundboardUsage = new Array();

var guild;
var internalMax = 0;
const leaderboardSize = 10;

var tools;
var client;

const pages = ['🗣️ Voice', '⌨️ Messages', '🔊 Soundboard'];

module.exports = {
  name: 'leaderboard',
  description: 'leaderboard',
  guildOnly: true,
  async execute(message, args,cClient) {
    var date = new Date();
    var startTime = date.getTime();
    client = cClient;
    tools = client.getTools();
    guild = message.guild;

    loadLeaderboards(client).then(function(){

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
      client.getLogger().log('info','Leaderboard Command executed in '+client.getTools().calculateExecutionTime(startTime)+'ms');
    })
  },
};


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
  var leaderboardArray = new Array();

  if(lifetime){
    totalConnectionTime.forEach((item, i) => {
      var user = { userid: item.id, totalTime: item.totalTime };
      leaderboardArray.push(user);
    });
  }
  else{
    monthlyConnectionTime.forEach((item, i) => {
      var user = { userid: item.id, totalTime: item.totalTime };
      leaderboardArray.push(user);
    });
  }

  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;

  var rows = new Array();
  rows.push(['#','Name','Time']);

  for (let i = 0; i < leaderboardArray.length; i++) {
    var readableTotalConnectionTime = tools.parseMillisecondsIntoReadableTime(
      leaderboardArray[i].totalTime
    );
    var userName = "";
    try {
      userName = guild.member(leaderboardArray[i].userid)
      .displayName;
    } catch (e) {
    }
    if (i >= start && i< end) {
      rows.push([(i + 1).toString(),userName,readableTotalConnectionTime]);
    }
  }

  embed.setDescription(tools.generateTable(rows));
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
  var leaderboardArray;
  if(lifetime){
    leaderboardArray = userChatMessages;
  }
  else{
    leaderboardArray = monthlyUserChatMessages
  }

  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;

  var rows = new Array();
  rows.push(['#','Name','Messages']);

  for (let i = 0; i < leaderboardArray.length; i++) {
    var userName = "";
    try {
      userName = guild.member(leaderboardArray[i].id)
      .displayName;
    } catch (e) {
    }

    if (i >= start && i< end) {
      rows.push([(i + 1).toString(),userName,leaderboardArray[i].messages]);
    }
  }

  embed.setDescription(tools.generateTable(rows));
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
  var leaderboardArray = monthlySoundboardUsage;
  if(lifetime){
    leaderboardArray = soundboardUsage;
  }

  var start = leaderboardSize * internalPage;
  var end = start + leaderboardSize;

  var rows = new Array();
  rows.push(['#','Name','Plays']);

  for (let i = 0; i < leaderboardArray.length; i++) {
    if (i >= start && i< end) {
      rows.push([(i + 1).toString(),leaderboardArray[i].command,leaderboardArray[i].uses]);
    }
  }
  embed.setDescription(tools.generateTable(rows));
}

function generateLeaderboardEmbeds(lifetime){

  var leaderboardEmbeds = new Map();
  var date = new Date();

  var time =  tools.getMonthName(date.getMonth());
  if(lifetime){
    time = 'All-time'
  }

  pages.forEach((item, i) => {

    var title = pages[i];
    if(title === "🗣️ Voice"){
      //loop through each internal page
      var voiceLeaderboardEmbeds = new Array();
      var length = 0;
      if(lifetime)length = totalConnectionTime.length/leaderboardSize;
      else length = monthlyConnectionTime.length/leaderboardSize
      for (var o = 0; o < Math.ceil(length); o++) {
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
      var length = 0;
      if(lifetime)length = userChatMessages.length/leaderboardSize;
      else length = monthlyUserChatMessages.length/leaderboardSize
      for (var o = 0; o < Math.ceil(length); o++) {
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
      var length = 0;
      if(lifetime)length = soundboardUsage.length/leaderboardSize;
      else length = monthlySoundboardUsage.length/leaderboardSize
      for (var o = 0; o < Math.ceil(length); o++) {
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

async function loadLeaderboards(client){
  await client.getDbHelper().getAllTimeUserMessagesTotals().then(function(result){
    userChatMessages = result;
  });

  await client.getDbHelper().getMonthlyUserMessagesTotals().then(function(result){
    monthlyUserChatMessages = result;
  });

  await client.getDbHelper().getAllTimeUserConnectionsTotals().then(function(result){
    totalConnectionTime = result;
  });

  await client.getDbHelper().getMonthlyUserConnectionsTotals().then(function(result){
    monthlyConnectionTime = result;
  });

  await client.getDbHelper().getMonthlySoundboardTotals().then(function(result){
    monthlySoundboardUsage = result;
  });

  await client.getDbHelper().getAllTimeSoundboardTotals().then(function(result){
    soundboardUsage = result;
  });
}
