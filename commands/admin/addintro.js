module.exports = {
  name: 'addintro',
  description: 'Add a intro gif',
  adminOnly:true,
  args: true,
  numArgs:2,
  usage: '<userid> <link>',
  execute(message, args,client) {
    if(!client.getDbHelper().getUsers().get(args[0])) return message.reply('That user doesnt exist');
    if(!isValidUrl(args[1])) return message.reply('Please provide a valid URL');
    client.getDbHelper().addUserIntro(args[0],args[1]);
    message.delete().catch(err => console.log(err));
  },
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
