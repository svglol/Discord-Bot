module.exports = {
  name: 'skip',
  description: 'skip',
  adminOnly:true,
  execute(message, args,client) {
    client.getSound().skip(message);
  },
};
