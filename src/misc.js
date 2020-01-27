const Discord = require('discord.js');
const prefix = require('../config.json').prefix;

module.exports = {
  listen:function(client,sound,soundCommands,gifCommands){
    client.on('message', message => {
      if(message.content.charAt(0) == prefix){
        var msg = message.content.substring(1);

        if(msg == "help"){
          helpMessage(message,client,soundCommands,gifCommands);
        }

        //Limit these commands to admin only
        if (message.member.hasPermission("ADMINISTRATOR")){
          //clear any chatcommands in the channel
          if(msg == "clear"){
            message.channel.messages.fetch(20).then(messages => {
              var messagesToDelete = new Array();
              messages.forEach(chatMessage => {
                if(chatMessage.content.charAt(0) == prefix){
                  messagesToDelete.push(chatMessage);
                }
                if(chatMessage.author.bot){
                  messagesToDelete.push(chatMessage);
                }
              });
              message.channel.bulkDelete(messagesToDelete);
            });
          }

          if(msg == "stop"){
            sound.stop(message);
          }
          if(msg == "skip"){
            sound.skip(message);
          }

          if(msg == "reset"){
            reset(sound,message,client);
          }
        }

      }
    });
  }
};

async function reset(sound,message,client){
  await message.delete(1000).catch(err => console.log(err));
  await sound.stop(message);
  client.destroy();
  throw 'restarting'
};


function helpMessage(message, client,soundCommands,gifCommands){

  var soundboardEmbeds = generateSoundboardEmbeds(soundCommands);
  var gifEmbeds = generateGifEmbeds(gifCommands);

  var embeds = soundboardEmbeds.concat(gifEmbeds);

  message.channel.send(embeds[0]).then((msg)=>{
    var page = 0;

    // msg.react('⬅');
    // msg.react('➡');
    msg.react('🔊');
    msg.react('🖼');
    msg.react('❌');

    const filter = (reaction, user) => {
      return ['⬅', '➡','🔊','🖼','❌'].includes(reaction.emoji.name) && !user.bot && user.id === message.author.id;
    };

    const collector = msg.createReactionCollector(filter, { time: 60000 });
    collector.on('collect', (reaction,user) =>{
      reaction.users.remove(user);
      if(reaction.emoji.name === '⬅'){
        //go back a page
        if(page != 0){
          page--;
        }
        msg.edit(embeds[page]);
      }
      else if (reaction.emoji.name === '➡') {
        //go to next page
        if(page < embeds.length-1){
          page++;
        }
        msg.edit(embeds[page]);
      }
      else if(reaction.emoji.name === '🔊'){
        page = 0;
        msg.edit(embeds[page]);
      }
      else if (reaction.emoji.name === '🖼') {
        page = soundboardEmbeds.length;
        msg.edit(embeds[page]);
      }
      else if(reaction.emoji.name === '❌'){
        message.delete(1000).catch(err => console.log(err));
        msg.delete(1000).catch(err => console.log(err));
      }
    });
    collector.on('end', collection =>{
      //remove reactions once reaction collector has ended
      msg.reactions.removeAll();
    })
  });

}

function generateSoundboardEmbeds(soundCommands){
  soundboardEmbeds = new Array();

  var cmdLength = 0;
  soundCommands.forEach((item, i) => {
    cmdLength += item.command.length;
    cmdLength += 4;
  });

  var start = 0;
  var pages = Math.ceil(cmdLength/2048);

  for (var i = 0; i < pages; i++){

    var currentPage = i+1;
    const embed = new Discord.MessageEmbed()
    .setTitle(":loud_sound: Sound Commands")
    .setColor('#0099ff')
    .setFooter(currentPage+"/"+pages)
    .addField(':blue_circle: Prefix',"`"+prefix+"`")

    var soundsMessage = "";
    for (var j = start; j < soundCommands.length; j++) {
      addMessage = "`"+soundCommands[j].command+"` ";
      if(addMessage.length + soundsMessage.length < 2048){
        soundsMessage += addMessage;
      }else{
        start = j;
        break;
      }
    }
    embed.setDescription(soundsMessage);
    soundboardEmbeds.push(embed);
  }

  return soundboardEmbeds;
}

function generateGifEmbeds(gifCommands){
  gifEmbeds = new Array();

  var cmdLength = 0;
  gifCommands.forEach((item, i) => {
    cmdLength += item.command.length;
    cmdLength += 4;
  });

  var start = 0;
  var pages = Math.ceil(cmdLength/2048);

  for (var i = 0; i < pages; i++){

    var currentPage = i+1;
    const embed = new Discord.MessageEmbed()
    .setTitle(":frame_photo: Gif Commands")
    .setColor('#0099ff')
    .setFooter(currentPage+"/"+pages)
    .addField(':blue_circle: Prefix',"`"+prefix+"`")

    var soundsMessage = "";
    for (var j = start; j < gifCommands.length; j++) {
      addMessage = "`"+gifCommands[j].command+"` ";
      if(addMessage.length + soundsMessage.length < 2048){
        soundsMessage += addMessage;
      }else{
        start = j;
        break;
      }
    }
    embed.setDescription(soundsMessage);
    gifEmbeds.push(embed);
  }


  return gifEmbeds;
}
