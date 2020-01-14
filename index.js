const Discord = require('discord.js');
const client = new Discord.Client();

const tools = require('./src/tools.js');
const sound = require('./src/sound.js');


const intros = require('./commands/intros.json').intros;
const exits = require('./commands/exits.json').exits;
var gifCommands = require('./commands/gifcommands.json').commands;
const prefix = require('./commands/config.json').prefix;
const cooldown = require('./commands/config.json').cooldown;
var soundCommands = require('./commands/soundcommands.json').commands;

tools.sort(soundCommands,gifCommands);

client.on('ready', () => {
});

//Detect if user joins voice channel
var lastUsedIntroArray = new Array();
var lastUsedExitArray = new Array();

client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;

  var channel = newMember.guild.channels.find(ch => ch.name === 'general-chat');
  if (!channel) return;

  if(oldUserChannel === null && newUserChannel !== null) {
    // User Joins a voice channel
    var user = newMember;
    intros.forEach(obj => {
      if(user.id == obj.userid){
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
            channel.send(obj.link);
            lastUsedIntroArray[index].usedTime = currentTime;
          }
        } else{
          //post gif
          channel.send(obj.link);
          //add entry to lastUsedIntroArray
          lastUsedIntroArray.push(lastUsedUser);
        }
      }
    });

  } else if(newUserChannel === null){
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

      var soundsMessage = "";
      soundCommands.forEach((obj, key) => {
        soundsMessage += "`"+obj.command+"` ";
      });

      var gifMessage = "";
      gifCommands.forEach((obj, key) => {
        gifMessage += "`"+obj.command+"` ";
      });

      const helpEmbed = new Discord.MessageEmbed()
      .setTitle("Commands")
      .setColor('#0099ff')
      .addField(':blue_circle: Prefix',"`"+prefix+"`")
      .addField(':loud_sound: Sound Commands', soundsMessage)
      .addField(':frame_photo: GIF Commands', gifMessage)

      message.channel.send(helpEmbed);
    }

    if(msg == "stop"){
      sound.stop(message);
    }
    if(msg == "skip"){
      sound.skip(message);
    }

    //gif commands
    gifCommands.forEach(obj => {
      if(msg == obj.command){
        message.channel.send(obj.link);
      }
    });

    //sound clip chatcommands
    splitCommands = msg.split(" ");
    for (let i = 0; i < splitCommands.length; i++) {
      var end = false;
      if(i === splitCommands.length-1){
        end = true;
      }
      soundCommands.forEach(obj => {
        if(splitCommands[i] == obj.command){
          sound.queue(message,obj,end);
        }
      });
    }

  }
});

client.login(process.env.TOKEN);
