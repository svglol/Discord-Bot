module.exports = {
  name: 'addgif',
  description: 'Add a gif command',
  adminOnly: true,
  args: true,
  numArgs: 2,
  usage: '<command> <link>',
  execute (message, args, client) {
    if (client.commands.get(args[0])) return message.reply('That command name is already taken');
    if (!isValidUrl(args[1])) return message.reply('Please provide a valid URL');
    client.dbHelper.addGifCommand(args[0], args[1], new Date().getTime());
    client.commandsLoader.addGifCommand(client, args[0], args[1]);
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
