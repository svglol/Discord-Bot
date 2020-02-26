const Discord = require('discord.js');

var currectConnectionTime = new Array();
var totalConnectionTime = new Array();
var userChatMessages = new Array();
var monthlyConnectionTime = new Array();

module.exports = {
  name: 'stats',
  description: 'stats',
  async execute(message, args,client) {

    currectConnectionTime = client.getStats().getCurrentConnectionTime();
    totalConnectionTime = client.getStats().getTotalConnectionTime();
    monthlyConnectionTime = client.getStats().getMonthlyConnectionTime();

    var totalVoice = 0;
    var monthlyVoice = 0;
    var totalVoiceRank = '#0';
    var monthlyVoiceRank = '#0';

    var totalMessagesRank = '#0';
    await client.getDbHelper().getUserMessageAllTimeRank(message.author.id).then(function(result){
      totalMessagesRank = result;
    })

    var monthlyMessagesRank = '#0';
    await client.getDbHelper().getUserMessageMonthlyRank(message.author.id).then(function(result){
      monthlyMessagesRank = result;
    })

    //get all time and monthly messages for user
    var totalMessages = 0;
    var monthlyMessages = 0;
    await client.getDbHelper().getUserMessages(message.author.id).then(function(userChatMessages){
      totalMessages = userChatMessages.length;
      var date = new Date();
      var currentMonth = date.getMonth();
      var currentYear = date.getYear();
      userChatMessages.forEach((item, i) => {
        messageDate = new Date(item.date);
        if(currentMonth == messageDate.getMonth() && currentYear == messageDate.getYear()){
          monthlyMessages++;
        }
      });
    })

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
        totalVoice = client.getTools().parseMillisecondsIntoReadableTime(totalConnectionTime)
      }
    });

    monthlyConnectionTime.forEach((item, i) => {
      if(item.userid == message.author.id){
        var totalConnectionTime = parseInt(currentConnectedTime) + parseInt(item.totalTime);
        monthlyVoice = client.getTools().parseMillisecondsIntoReadableTime(totalConnectionTime)
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
    var month =  client.getTools().getMonthName(date.getMonth());

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

    embed.setDescription(client.getTools().generateTable(data));

    message.reply(embed);

  },
};


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
