const Discord = require('discord.js');
const prefix = require('../config.json').prefix;

module.exports = {
  listen:function(client,sound,soundCommands,gifCommands){
    client.on('message', message => {
      if(message.content.charAt(0) == prefix){
        var msg = message.content.substring(1);

        if(msg == "help"){
          var soundsMessageArray = new Array();
          var soundsMessage = "";
          soundCommands.forEach((obj, key) => {
            addMessage = "`"+obj.command+"` ";
            if(addMessage.length + soundsMessage.length < 1024){
              soundsMessage += addMessage;
            }else{
              soundsMessageArray.push(soundsMessage);
              soundsMessage ="";
              soundsMessage += addMessage;
            }
          });
          soundsMessageArray.push(soundsMessage);

          var gifMessage = "";
          gifCommands.forEach((obj, key) => {
            gifMessage += "`"+obj.command+"` ";
          });

          const helpEmbed = new Discord.MessageEmbed()
          .setTitle("Commands")
          .setColor('#0099ff')
          .addField(':blue_circle: Prefix',"`"+prefix+"`")

          var firstSoundMessage = true;
          soundsMessageArray.forEach((item, i) => {
            helpEmbed.addField(':loud_sound: Sound Commands', item)
          });

          helpEmbed.addField(':frame_photo: GIF Commands', gifMessage)

          message.channel.send(helpEmbed);
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
            message.delete(1000).catch(err => console.log(err));
            sound.stop(message);
            client.destroy();
          }
        }

      }
    });
  }
};
