const Discord = require('discord.js');
var prefix = '';

module.exports = {
  name: 'help',
  aliases: ['commands'],
  description: 'help',
  execute (message, args, client) {
    prefix = client.prefix;
    helpMessage(message, client, client.getSoundCommands(), client.getGifCommands(), client.getNewSoundCommands());
  }
};

function helpMessage (message, client, soundCommands, gifCommands, newSoundCommands) {
  soundCommands.sort(function (a, b) {
    if (a[0] < b[0]) {
      return -1;
    }
    if (b[0] < a[0]) {
      return 1;
    }
    return 0;
  });
  gifCommands.sort(function (a, b) {
    if (a[0] < b[0]) {
      return -1;
    }
    if (b[0] < a[0]) {
      return 1;
    }
    return 0;
  });

  var soundboardEmbeds = generateSoundboardEmbeds(soundCommands);
  var gifEmbeds = generateGifEmbeds(gifCommands);
  var newSoundEmbeds = generateNewSoundboardEmbed(newSoundCommands);

  var embeds = soundboardEmbeds.concat(gifEmbeds);

  var currentPage = 'Sound';

  message.channel.send(embeds[0]).then((msg) => {
    var page = 0;

    msg.react('⬇');
    msg.react('⬆');

    msg.react('🔊');
    msg.react('🆕');
    msg.react('🖼');

    const filter = (reaction, user) => {
      return ['⬆', '⬇', '🔊', '🖼', '❌', '🆕'].includes(reaction.emoji.name) && !user.bot && user.id === message.author.id;
    };

    const collector = msg.createReactionCollector(filter, { time: 60000 });
    collector.on('collect', (reaction, user) => {
      reaction.users.remove(user);
      if (reaction.emoji.name === '⬆') {
        if (page !== 0) {
          page--;
        }
        var embed;
        if (currentPage === 'Sound') { embed = soundboardEmbeds[page]; }

        if (currentPage === 'Gifs') { embed = gifEmbeds[page]; }

        if (currentPage === 'New') { embed = newSoundEmbeds[page]; }

        msg.edit(embed);
      } else if (reaction.emoji.name === '⬇') {
        if (currentPage === 'Sound') {
          if (page < soundboardEmbeds.length - 1) {
            page++;
          }
          embed = soundboardEmbeds[page];
        }

        if (currentPage === 'Gifs') {
          if (page < gifEmbeds.length - 1) {
            page++;
          }
          embed = gifEmbeds[page];
        }

        if (currentPage === 'New') {
          if (page < newSoundEmbeds.length - 1) {
            page++;
          }
          embed = soundboardEmbeds[page];
        }

        msg.edit(embed);
      } else if (reaction.emoji.name === '🔊') {
        page = 0;
        currentPage = 'Sound';
        msg.edit(soundboardEmbeds[page]);
      } else if (reaction.emoji.name === '🖼') {
        page = 0;
        currentPage = 'Gifs';
        msg.edit(gifEmbeds[page]);
      } else if (reaction.emoji.name === '🆕') {
        page = 0;
        currentPage = 'New';
        msg.edit(newSoundEmbeds[page]);
      }
    });
    collector.on('end', collection => {
      // remove reactions once reaction collector has ended
      msg.reactions.removeAll();
    });
  });
}

function generateNewSoundboardEmbed (newSoundCommands) {
  var soundboardEmbeds = [];

  var cmdLength = 0;
  newSoundCommands.forEach((item, i) => {
    cmdLength += item[1].name.length;
    cmdLength += 4;
  });

  var start = 0;
  var pages = Math.ceil(cmdLength / 2048);

  for (var i = 0; i < pages; i++) {
    var currentPage = i + 1;
    const embed = new Discord.MessageEmbed()
      .setTitle(':loud_sound: Sound Commands')
      .setColor('#0099ff')
      .setFooter(currentPage + '/' + pages)
      .addFields({ name: ':blue_circle: Prefix', value: '`' + prefix + '`' });

    var soundsMessage = '';

    for (var j = start; j < newSoundCommands.length; j++) {
      var addMessage = '`' + newSoundCommands[j][1].name + '` ';
      if (addMessage.length + soundsMessage.length < 2048) {
        soundsMessage += addMessage;
      } else {
        start = j;
        break;
      }
    }
    embed.setDescription(soundsMessage);
    soundboardEmbeds.push(embed);
  }

  return soundboardEmbeds;
}

function generateSoundboardEmbeds (soundCommands) {
  var soundboardEmbeds = [];

  var cmdLength = 0;
  soundCommands.forEach((item, i) => {
    cmdLength += item[1].name.length;
    cmdLength += 4;
  });

  var start = 0;
  var pages = Math.ceil(cmdLength / 2048);

  for (var i = 0; i < pages; i++) {
    var currentPage = i + 1;
    const embed = new Discord.MessageEmbed()
      .setTitle(':loud_sound: Sound Commands')
      .setColor('#0099ff')
      .setFooter(currentPage + '/' + pages)
      .addFields({ name: ':blue_circle: Prefix', value: '`' + prefix + '`' });

    var soundsMessage = '';

    for (var j = start; j < soundCommands.length; j++) {
      var addMessage = '`' + soundCommands[j][1].name + '` ';
      if (addMessage.length + soundsMessage.length < 2048) {
        soundsMessage += addMessage;
      } else {
        start = j;
        break;
      }
    }
    embed.setDescription(soundsMessage);
    soundboardEmbeds.push(embed);
  }

  return soundboardEmbeds;
}

function generateGifEmbeds (gifCommands) {
  var gifEmbeds = [];

  var cmdLength = 0;
  gifCommands.forEach((item, i) => {
    cmdLength += item[1].name.length;
    cmdLength += 4;
  });

  var start = 0;
  var pages = Math.ceil(cmdLength / 2048);

  for (var i = 0; i < pages; i++) {
    var currentPage = i + 1;
    const embed = new Discord.MessageEmbed()
      .setTitle(':frame_photo: Gif Commands')
      .setColor('#0099ff')
      .setFooter(currentPage + '/' + pages)
      .addFields({ name: ':blue_circle: Prefix', value: '`' + prefix + '`' });

    var soundsMessage = '';
    for (var j = start; j < gifCommands.length; j++) {
      var addMessage = '`' + gifCommands[j][1].name + '` ';
      if (addMessage.length + soundsMessage.length < 2048) {
        soundsMessage += addMessage;
      } else {
        start = j;
        break;
      }
    }
    embed.setDescription(soundsMessage);
    gifEmbeds.push(embed);
  }

  return gifEmbeds;
}
