module.exports = {
  name: 'stop',
  description: 'stop',
  adminOnly:true,
  guildOnly: true,
  execute(message, args,client) {
    client.getSound().stop(message);
  },
};
