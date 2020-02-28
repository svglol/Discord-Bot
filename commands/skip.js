module.exports = {
  name: 'skip',
  description: 'skip',
  adminOnly:true,
  guildOnly: true,
  execute(message, args,client) {
    client.getSound().skip(message);
  },
};
