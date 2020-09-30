module.exports = {
  name: 'stop',
  description: 'stop',
  adminOnly: true,
  guildOnly: true,
  execute (message, args, client) {
    client.soundManager.stop(message);
  }
};
