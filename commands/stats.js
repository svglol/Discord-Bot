const Discord = require('discord.js');

var currectConnectionTime = new Array();
var totalConnectionTime = new Array();
var userChatMessages = new Array();
var monthlyConnectionTime = new Array();

module.exports = {
  name: 'stats',
  description: 'stats',
  async execute(message, args,client) {
    var date = new Date();
    var startTime = date.getTime();

    var monthlyVoiceRank = '#0';
    var monthlyVoice = 0;
    await client.getDbHelper().getUserConnectionMonthlyRank(message.author.id).then(function(result){
      monthlyVoiceRank = result.rank;
      monthlyVoice = client.getTools().parseMillisecondsIntoReadableTime(result.time);
    })

    var totalVoiceRank = '#0';
    var totalVoice = 0;
    await client.getDbHelper().getUserConnectionAllTimeRank(message.author.id).then(function(result){
      totalVoiceRank = result.rank;
      totalVoice = client.getTools().parseMillisecondsIntoReadableTime(result.time);
    })

    var totalMessages = 0;
    var totalMessagesRank = '#0';
    await client.getDbHelper().getUserMessageAllTimeRank(message.author.id).then(function(result){
      totalMessagesRank = result.rank;
      totalMessages = result.messages;
    })

    var monthlyMessages = 0;
    var monthlyMessagesRank = '#0';
    await client.getDbHelper().getUserMessageMonthlyRank(message.author.id).then(function(result){
      monthlyMessagesRank = result.rank;
      monthlyMessages = result.messages;
    })

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

    client.getLogger().log('info','Stats Command executed in '+client.getTools().calculateExecutionTime(startTime)+'ms');
  },
};
