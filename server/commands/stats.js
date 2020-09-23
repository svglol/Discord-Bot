const Discord = require('discord.js');

var currectConnectionTime = new Array();
var totalConnectionTime = new Array();
var userChatMessages = new Array();
var monthlyConnectionTime = new Array();

module.exports = {
  name: 'stats',
  description: 'stats',
  guildOnly: true,
  async execute (message, args, client) {
    var date = new Date();
    var startTime = date.getTime();

    var monthlyVoiceRank = '#0';
    var monthlyVoice = 0;
    await client.getDbHelper().getUserConnectionMonthlyRank(message.author.id).then(function (result) {
      monthlyVoiceRank = result.rank;
      if (Number.isInteger(result.time)) {
        monthlyVoice = client.getTools().parseMillisecondsIntoReadableTime(result.time);
      } else {
        monthlyVoice = result.time;
      }
    });

    var totalVoiceRank = '#0';
    var totalVoice = 0;
    await client.getDbHelper().getUserConnectionAllTimeRank(message.author.id).then(function (result) {
      totalVoiceRank = result.rank;
      if (Number.isInteger(result.time)) {
        totalVoice = client.getTools().parseMillisecondsIntoReadableTime(result.time);
      } else {
        totalVoice = result.time;
      }
    });

    var totalMessages = 0;
    var totalMessagesRank = '#0';
    await client.getDbHelper().getUserMessageAllTimeRank(message.author.id).then(function (result) {
      totalMessagesRank = result.rank;
      totalMessages = result.messages;
    });

    var monthlyMessages = 0;
    var monthlyMessagesRank = '#0';
    await client.getDbHelper().getUserMessageMonthlyRank(message.author.id).then(function (result) {
      monthlyMessagesRank = result.rank;
      monthlyMessages = result.messages;
    });

    var embed = new Discord.MessageEmbed()
      .setTitle('Stats')
      .setAuthor(message.member.displayName, message.author.displayAvatarURL())
      .setColor('#0099ff');

    var date = new Date();
    var month = client.getTools().getMonthName(date.getMonth());

    var rows = new Array();
    rows.push(['All-time Voice', '']);
    rows.push(['Pos', 'Time']);
    rows.push([totalVoiceRank.toString(), totalVoice.toString()]);
    rows.push([' ', ' ']);
    rows.push([month + ' Voice', '']);
    rows.push(['Pos', 'Time']);
    rows.push([monthlyVoiceRank.toString(), monthlyVoice.toString()]);
    rows.push([' ', ' ']);
    rows.push(['All-time Messages', '']);
    rows.push(['Pos', 'Messages']);
    rows.push([totalMessagesRank.toString(), totalMessages.toString()]);
    rows.push([' ', ' ']);
    rows.push([month + ' Messages', '']);
    rows.push(['Pos', 'Messages']);
    rows.push([monthlyMessagesRank.toString(), monthlyMessages.toString()]);

    embed.setDescription(client.getTools().generateTable(rows));
    message.reply(embed);

    client.getLogger().log('info', 'Stats Command executed in ' + client.getTools().calculateExecutionTime(startTime) + 'ms');
  }
};
