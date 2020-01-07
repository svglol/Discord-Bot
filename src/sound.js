var queue = new Array();
var dispatcher;
var voiceChannel;

module.exports = {
  queue: function (message,obj) {
    var userVoiceChannel = message.member.voice.channel;
    if(userVoiceChannel != undefined){
      queueItem = [message,obj];
      queue.push(queueItem);
      if(dispatcher == null){
        playNextInQueue();
      }
    }
  },
  stop: function(message){
    if(dispatcher != null){
      voiceChannel.leave();
      queue.forEach(obj => {
        obj[0].delete(1000);
      });
      dispatcher = null;
      queue = new Array();
    }
    message.delete(1000);
  },
  skip: function(message){
    if(dispatcher != null){
      dispatcher.end();
    }
    message.delete(1000);
  }
};

var playNextInQueue = function (){
  var message = queue[0][0];
  var file = queue[0][1].file;
  voiceChannel = message.member.voice.channel;
  voiceChannel.join().then(connection => {
    dispatcher = connection.play(file);
    dispatcher.on('end', () => {
      dispatcher = null;
      message.delete(1000);
      queue.shift();
      if(queue.length != 0){
        playNextInQueue();
      }
      else{
        voiceChannel.leave();
        voiceChannel == null;
      }
    });
  }).catch(err => console.log(err))
}
