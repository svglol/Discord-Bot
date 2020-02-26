module.exports = {
  name: 'reset',
  description: 'reset',
  adminOnly:true,
  async execute(message, args,client) {
    await message.delete().catch(err => console.log(err));
    await client.getSound().stop(message);
    process.exit(1);
    throw 'restarting'
  },
};
