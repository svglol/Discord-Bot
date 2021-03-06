const Discord = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'stats',
  guildOnly: true,
  async execute (message, args, client) {
    var date = new Date();
    var startTime = date.getTime();

    var monthlyVoiceRank = '#0';
    var monthlyVoice = 0;
    await client.dbHelper.getUserConnectionMonthlyRank(message.author.id).then(function (result) {
      monthlyVoiceRank = result.rank;
      if (Number.isInteger(result.time)) {
        monthlyVoice = client.tools.parseMillisecondsIntoReadableTime(result.time);
      } else {
        monthlyVoice = result.time;
      }
    });

    var totalVoiceRank = '#0';
    var totalVoice = 0;
    await client.dbHelper.getUserConnectionAllTimeRank(message.author.id).then(function (result) {
      totalVoiceRank = result.rank;
      if (Number.isInteger(result.time)) {
        totalVoice = client.tools.parseMillisecondsIntoReadableTime(result.time);
      } else {
        totalVoice = result.time;
      }
    });

    var totalMessages = 0;
    var totalMessagesRank = '#0';
    await client.dbHelper.getUserMessageAllTimeRank(message.author.id).then(function (result) {
      totalMessagesRank = result.rank;
      totalMessages = result.messages;
    });

    var monthlyMessages = 0;
    var monthlyMessagesRank = '#0';
    await client.dbHelper.getUserMessageMonthlyRank(message.author.id).then(function (result) {
      monthlyMessagesRank = result.rank;
      monthlyMessages = result.messages;
    });

    var embed = new Discord.MessageEmbed()
      .setTitle('Stats')
      .setAuthor(message.member.displayName, message.author.displayAvatarURL())
      .setColor('#0099ff');

    date = new Date();
    var month = client.tools.getMonthName(date.getMonth());

    var rows = [];
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

    embed.setDescription(client.tools.generateTable(rows));
    message.reply(embed);

    client.logger.log('info', 'Stats Command executed in ' + client.tools.calculateExecutionTime(startTime) + 'ms');
  }
};
