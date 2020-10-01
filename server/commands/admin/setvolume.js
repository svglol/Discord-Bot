module.exports = {
  name: 'setvolume',
  description: 'Set the volume of a specific sound',
  adminOnly: true,
  args: true,
  numArgs: 2,
  usage: '<soundcommand> <volume>',
  execute (message, args, client) {
    var volume = args[1];
    if ((volume - 1) * (volume - 0) <= 0) {
      client.dbHelper.setSoundCommandVolume(args[0], args[1]);
      client.commands.get(args[0]).volume = volume;
      message.delete().catch(err => console.log(err));
    } else {
      var reply = 'Volume must be between 0 and 1';
      message.reply(reply);
    }
  }
};
