module.exports = {
  name: 'random',
  description: 'play a random soundboard file',
  guildOnly: true,
  execute (message, args, client) {
    var soundCommands = client.getSoundCommands();
    var random = soundCommands[Math.floor(Math.random() * soundCommands.length)][1];
    random.execute(message, args, client);
  }
};
