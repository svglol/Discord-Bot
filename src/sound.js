var queue = new Array();
var deletedMessages = new Array();
var dispatcher;
var voiceChannel;

module.exports = {
  queue: function (message,obj,end) {
    var userVoiceChannel = message.member.voice.channel;
    if(userVoiceChannel != undefined){
      queueItem = [message,obj,end];
      queue.push(queueItem);
      if(dispatcher == null && voiceChannel == null){
        playNextInQueue();
      }
    }
  },
  stop: function(message){
    if(dispatcher != null){
      voiceChannel.leave();
      voiceChannel = null;
      queue.forEach(obj => {
        if(!deletedMessages.includes(obj[0].id)){
          obj[0].delete(1000).catch(err => console.log(err));
          deletedMessages.push(obj[0].id);
        }
      });
      dispatcher = null;
      queue = new Array();
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

var playNextInQueue = async function (){
  var message = queue[0][0];
  var file = queue[0][1].file;
  var end = queue[0][2];
  
  voiceChannel = message.member.voice.channel;
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
      queue.shift();
      if(queue.length != 0){
        playNextInQueue();
      }
      else{
        voiceChannel.leave();
        voiceChannel = null;
      }
    });
  }).catch(err => {
    console.log(err)
  })
}
