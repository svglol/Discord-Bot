var soundQueue = new Array();
var deletedMessages = new Array();
var dispatcher;
var voiceChannel;
const prefix = require('../config.json').prefix;
var stats;

module.exports = {
  listen:function(client){

    const soundCommands = client.getSoundCommands();
    const adminSoundCommands = client.getAdminSoundCommands();
    stats = client.getStats();

    client.on('message', message => {
      if(message.content.charAt(0) == prefix){
        var msg = message.content.substring(1);
        splitCommands = msg.split(" ");
        for (let i = 0; i < splitCommands.length; i++) {
          var end = false;

          //check if last command after splitting them up
          if(i === splitCommands.length-1){
            end = true;
          }

          //check if command is to play random sfx
          if(splitCommands[i] == "random"){
            queue(message,soundCommands[Math.floor(Math.random()*soundCommands.length)],end);
          }

          //check if command is admin only
          if (message.member.hasPermission("ADMINISTRATOR")){
            adminSoundCommands.forEach(obj => {
              if(splitCommands[i] == obj.command){
                //delete message instantly
                if(!deletedMessages.includes(message.id)){
                  deletedMessages.push(message.id);
                  message.delete(1000).catch(err => console.log(err));
                }
                queue(message,obj,end);
              }
            });
          }

          if (message.author.id === '341873460957413386') {
            soundCommands.forEach((obj, i) => {
              if(obj.command == "fail"){
                queue(message,obj,end);
              }
            });

          } else {
            soundCommands.forEach(obj => {
              if(splitCommands[i] == obj.command){
                queue(message,obj,end);
              }
            });
          }
        }
      }
    });
  },
  stop: function(message){
    if(dispatcher != null){
      voiceChannel.leave();
      voiceChannel = null;
      soundQueue.forEach(obj => {
        if(!deletedMessages.includes(obj[0].id)){
          obj[0].delete(1000).catch(err => console.log(err));
          deletedMessages.push(obj[0].id);
        }
      });
      dispatcher = null;
      soundQueue = new Array();
    }
    message.delete(1000).catch(err => console.log(err));
  },
  skip: function(message){
    if(dispatcher != null){
      dispatcher.end();
    }
    message.delete(1000).catch(err => console.log(err));
  }
};

var queue = function (message,obj,end) {
  var userVoiceChannel = message.member.voice.channel;
  if(userVoiceChannel != undefined){
    stats.addSoundBoardUse(obj.command);
    soundQueueItem = [message,obj,end];
    soundQueue.push(soundQueueItem);
    if(dispatcher == null && voiceChannel == null){
      playNextInQueue();
    }
  }
}

var lastDisconTime = 0;

var playNextInQueue = async function (){
  var message = soundQueue[0][0];
  var file = soundQueue[0][1].file;
  var end = soundQueue[0][2];
  voiceChannel = message.member.voice.channel;

  var date = new Date();
  var currentTime = date.getTime();

  var reconWait = 500;
  if(lastDisconTime > currentTime-reconWait){
    await PromiseTimeout(lastDisconTime - (currentTime - reconWait));
  }

  await voiceChannel.join().then(async connection => {
    dispatcher = await connection.play(file);
    dispatcher.on('end', () => {
      dispatcher = null;
      if(end){
        if(!deletedMessages.includes(message.id)){
          message.delete(1000).catch(err => console.log(err));
          deletedMessages.push(message.id);
        }
      }
      soundQueue.shift();
      if(soundQueue.length != 0){
        playNextInQueue();
      }
      else{
        connection.disconnect();
        voiceChannel = null;
        var date = new Date();
        var currentTime = date.getTime();
        lastDisconTime = currentTime;
      }
    });
  }).catch(error => {
    console.log('Reconnected too quickly');
    process.exit(1);
  })
}

function PromiseTimeout(delayms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}
