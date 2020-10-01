module.exports = {
  name: 'skip',
  description: 'skip',
  adminOnly: true,
  guildOnly: true,
  execute (message, args, client) {
    client.soundManager.skip(message);
  }
};
