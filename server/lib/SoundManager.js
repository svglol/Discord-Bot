var soundQueue = [];
var dispatcher;
var voiceChannel;
var stats;
var lastDisconTime = 0;
var client;

class SoundManager {
  constructor (discordClient) {
    client = discordClient;
    stats = client.stats;
  }
  stop (message) {
    if (dispatcher !== null) {
      if (voiceChannel) {
        voiceChannel.leave();
        voiceChannel = null;
      }
      soundQueue.forEach(obj => {
        if (obj.message) {
          obj.message.delete().catch(err => console.log(err));
        }
      });
      dispatcher = null;
      soundQueue = [];
    }
    if (message !== undefined) {
      message.delete().catch(err => console.log(err));
    }
  }

  skip (message) {
    if (dispatcher !== null) {
      dispatcher.end();
    }
    if (message !== null) {
      message.delete().catch(err => console.log(err));
    }
  }
  queue (message, soundCommand, end) {
    let userVoiceChannel = message.member.voice.channel;
    if (userVoiceChannel !== undefined) {
      stats.addSoundBoardUse(message.author.id, soundCommand.command);
      let soundQueueItem = { voiceChannel: message.member.voice.channel, soundCommand: soundCommand, end: end, message: message };
      soundQueue.push(soundQueueItem);
      if (dispatcher == null && voiceChannel == null) {
        playNextInQueue();
      }
    }
  }
  queueToChannel (channel, soundCommand, end) {
    let userVoiceChannel = channel;
    if (userVoiceChannel !== undefined) {
      let soundQueueItem = { voiceChannel: channel, soundCommand: soundCommand, end: end };
      soundQueue.push(soundQueueItem);
      if (dispatcher == null && voiceChannel == null) {
        playNextInQueue();
      }
    }
  }
}

module.exports = SoundManager;

async function playNextInQueue () {
  let nextInQueue = soundQueue[0];
  let message = nextInQueue.message;
  let file = nextInQueue.soundCommand.file;
  let end = nextInQueue.end;
  voiceChannel = nextInQueue.voiceChannel;

  let date = new Date();
  let currentTime = date.getTime();

  let reconWait = 500;
  if (lastDisconTime > currentTime - reconWait) {
    await PromiseTimeout(lastDisconTime - (currentTime - reconWait));
  }

  await voiceChannel.join().then(async connection => {
    dispatcher = await connection.play(file);
    let volume = nextInQueue.soundCommand.volume;
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
        let date = new Date();
        let currentTime = date.getTime();
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
