const Discord = require('discord.js');
const client = new Discord.Client();

const intros = require('./intros.json').intros;
const exits = require('./exits.json').exits;
const commands = require('./chatcommands.json').commands;
const prefix = require('./chatcommands.json').prefix;
const sound = require('./soundcommands.json').commands;

soundPlaying = false;

client.on('ready', () => {
});

//Detect if user joins voice channel
const cooldown = 300000;
var lastUsedIntroArray = new Array();
var lastUsedExitArray = new Array();

client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;

  var channel = newMember.guild.channels.find(ch => ch.name === 'general-chat');
  if (!channel) return;

  if(oldUserChannel === undefined && newUserChannel !== undefined) {
    // User Joins a voice channel
    var user = newMember;
console.log("user joins channel");
    intros.forEach(obj => {
      if(user.id == obj.userid){
        console.log(user.id);
        var date = new Date();
        var currentTime = date.getTime();
        var lastUsedUser = {userid:user.id, usedTime:currentTime};

        //check if there is already an entry
        if(lastUsedIntroArray.some(lastUser => lastUser.userid === user.id)){
          //get the lastUser object
          var index;
          lastUsedIntroArray.some(function(entry, i) {
            if (entry.userid === user.id) {
              index = i;
              return true;
            }
          });

          //check if the cooldown time has passed
          if(currentTime > lastUsedIntroArray[index].usedTime + cooldown){
            //post gif and update entry in array
            console.log("send intro v1");
            channel.send(obj.link);
            lastUsedIntroArray[index].usedTime = currentTime;
          }
        } else{
          //post gif
          console.log("send intro v2");
          channel.send(obj.link);
          //add entry to lastUsedIntroArray
          lastUsedIntroArray.push(lastUsedUser);
        }
      }
    });

  } else if(newUserChannel === undefined){
    // User leaves a voice channel

    var user = newMember;
    exits.forEach(obj => {
      if(user.id == obj.userid){
        var date = new Date();
        var currentTime = date.getTime();
        var lastUsedUser = {userid:user.id, usedTime:currentTime};

        //check if there is already an entry
        if(lastUsedExitArray.some(lastUser => lastUser.userid === user.id)){
          //get the lastUser object
          var index;
          lastUsedExitArray.some(function(entry, i) {
            if (entry.userid === user.id) {
              index = i;
              return true;
            }
          });

          //check if the cooldown time has passed
          if(currentTime > lastUsedExitArray[index].usedTime + cooldown){
            //post gif and update entry in array
            channel.send(obj.link);
            lastUsedExitArray[index].usedTime = currentTime;
          }
        } else{
          //post gif
          channel.send(obj.link);
          //add entry to lastUsedExitArray
          lastUsedExitArray.push(lastUsedUser);
        }
      }
    });
  }
})

// Listen for commands
client.on('message', message => {
  if(message.content.charAt(0) == prefix){
    var msg = message.content.substring(1);
    if(msg == "help"){
      var soundsMessage = ">>> :loud_sound: "
      sound.forEach((obj, key) => {
        if (Object.is(sound.length - 1, key)) {
          soundsMessage += prefix+obj.command;
        }else{
          soundsMessage += prefix+obj.command +", ";
        }
      });
      message.channel.send(soundsMessage);

      var helpMessage = ">>> :tv: ";
      commands.forEach((obj, key) => {
        if (Object.is(commands.length - 1, key)) {
          helpMessage += prefix+obj.command;
        }else{
          helpMessage += prefix+obj.command +", ";
        }
      });
      message.channel.send(helpMessage);
    }

    //gif commands
    commands.forEach(obj => {
      if(msg == obj.command){
        message.channel.send(obj.link);
      }
    });

    //sound clip chatcommands
    sound.forEach(obj => {
      if(msg == obj.command){
        var voiceChannel = message.member.voice.channel;
        if(voiceChannel != undefined){

          if(!soundPlaying){
            voiceChannel.join().then(connection => {
              soundPlaying = true;
              const dispatcher = connection.play(obj.file);
              dispatcher.on('end', end => voiceChannel.leave());
              dispatcher.on('end', end => soundPlaying = false);
              dispatcher.on('end', end => message.delete(1000));
            }).catch(err => console.log(err))
          }
          else{
            message.delete(1000);
          }
        }
      }
    });
  }
});

client.login(process.env.TOKEN);
