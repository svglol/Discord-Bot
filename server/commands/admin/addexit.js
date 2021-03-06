module.exports = {
  name: 'addexit',
  description: 'Add a exit gif',
  adminOnly: true,
  args: true,
  numArgs: 2,
  usage: '<userid> <link>',
  execute (message, args, client) {
    if (!client.dbHelper.getUsers().get(args[0])) return message.reply('That user doesnt exist');
    if (!isValidUrl(args[1])) return message.reply('Please provide a valid URL');
    client.dbHelper.addUserExit(args[0], args[1]);
    message.delete().catch(err => console.log(err));
  }
};

function isValidUrl (string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
