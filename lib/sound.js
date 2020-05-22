var soundQueue = new Array();
var dispatcher;
var voiceChannel;
const prefix = require('../config.json').prefix;
var stats;
var dbHelper;

module.exports = {
  listen:function(client){
    stats = client.getStats();
    dbHelper = client.getDbHelper();
  },
  stop: function(message){
    if(dispatcher != null){
      voiceChannel.leave();
      voiceChannel = null;
      soundQueue.forEach(obj => {
        obj[0].delete().catch(err => console.log(err));
      });
      dispatcher = null;
      soundQueue = new Array();
    }
    message.delete().catch(err => console.log(err));
  },
  skip: function(message){
    if(dispatcher != null){
      dispatcher.end();
    }
    message.delete().catch(err => console.log(err));
  },
  queue: function(message,obj,end){
    var userVoiceChannel = message.member.voice.channel;
    if(userVoiceChannel != undefined){
      stats.addSoundBoardUse(message.author.id,obj.command);
      soundQueueItem = [message,obj,end];
      soundQueue.push(soundQueueItem);
      if(dispatcher == null && voiceChannel == null){
        playNextInQueue();
      }
    }
  }
};

var lastDisconTime = 0;

async function playNextInQueue(){
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
    var volume = soundQueue[0][1].volume;
    dispatcher.setVolume(volume);
    dispatcher.on('finish', () => {
      if(end){
        message.delete().catch(err => console.log(err));
      }
      soundQueue.shift();
      if(soundQueue.length != 0){
        connection.disconnect();
        voiceChannel = null;
        var date = new Date();
        var currentTime = date.getTime();
        lastDisconTime = currentTime;
        playNextInQueue();
      }
      else{
        connection.disconnect();
        voiceChannel = null;
        var date = new Date();
        var currentTime = date.getTime();
        lastDisconTime = currentTime;
      }
      dispatcher = null;
    });
  }).catch(error => {
    throw error;
    console.log('Reconnected too quickly');
    process.exit(1);
  })
}

function PromiseTimeout(delayms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}
