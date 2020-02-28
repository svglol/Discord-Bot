module.exports = {
  name: 'setvolume',
  description: 'Set the volume of a specific sound',
  adminOnly:true,
  args: true,
  numArgs:2,
  usage: '<soundcommand> <volume>',
  execute(message, args,client) {
    client.getDbHelper().addCommandVolume(args[0],args[1]);
    message.delete().catch(err => console.log(err));
  },
};
