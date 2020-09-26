var soundQueue = [];
var dispatcher;
var voiceChannel;
var stats;

module.exports = {
  listen: function (client) {
    stats = client.getStats();
  },
  stop: function (message) {
    if (dispatcher != null) {
      voiceChannel.leave();
      voiceChannel = null;
      soundQueue.forEach(obj => {
        obj[0].delete().catch(err => console.log(err));
      });
      dispatcher = null;
      soundQueue = [];
    }
    if (message != null) {
      message.delete().catch(err => console.log(err));
    }
  },
  skip: function (message) {
    if (dispatcher != null) {
      dispatcher.end();
    }
    if (message != null) {
      message.delete().catch(err => console.log(err));
    }
  },
  queue: function (message, obj, end) {
    var userVoiceChannel = message.member.voice.channel;
    if (userVoiceChannel !== undefined) {
      stats.addSoundBoardUse(message.author.id, obj.command);
      let soundQueueItem = [message.member.voice.channel, obj, end, message];
      soundQueue.push(soundQueueItem);
      if (dispatcher == null && voiceChannel == null) {
        playNextInQueue();
      }
    }
  },
  queueToChannel: function (channel, obj, end) {
    var userVoiceChannel = channel;
    if (userVoiceChannel !== undefined) {
      let soundQueueItem = [channel, obj, end];
      soundQueue.push(soundQueueItem);
      if (dispatcher == null && voiceChannel == null) {
        playNextInQueue();
      }
    }
  }
};

var lastDisconTime = 0;

async function playNextInQueue () {
  var message = soundQueue[0][3];
  var file = soundQueue[0][1].file;
  var end = soundQueue[0][2];
  var voiceChannel = soundQueue[0][0];

  var date = new Date();
  var currentTime = date.getTime();

  var reconWait = 500;
  if (lastDisconTime > currentTime - reconWait) {
    await PromiseTimeout(lastDisconTime - (currentTime - reconWait));
  }

  await voiceChannel.join().then(async connection => {
    dispatcher = await connection.play(file);
    var volume = soundQueue[0][1].volume;
    dispatcher.setVolume(volume);
    dispatcher.on('finish', () => {
      if (end) {
        if (message) {
          message.delete().catch(err => console.log(err));
        }
      }
      soundQueue.shift();
      if (soundQueue.length !== 0) {
        playNextInQueue();
      } else {
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
  });
}

function PromiseTimeout (delayms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}
