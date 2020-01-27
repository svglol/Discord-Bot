const Discord = require('discord.js');
const client = new Discord.Client();

const tools = require('./src/tools.js');
const sound = require('./src/sound.js');
const gifs = require('./src/gifs.js');
const misc = require('./src/misc.js');
const intro = require('./src/intro.js');
const stats = require('./src/stats.js');

const intros = require('./commands/intros.json').intros;
const exits = require('./commands/exits.json').exits;
const gifCommands = require('./commands/gifcommands.json').commands;
const prefix = require('./config.json').prefix;
const cooldown = require('./config.json').cooldown;
var soundCommands = [];
var adminSoundCommands = [];

tools.loadSoundCommands(soundCommands,adminSoundCommands);
tools.sort(soundCommands,gifCommands);

client.on('ready', () => {
  client.user.setActivity(prefix + 'help for commands', { type: 'PLAYING' })
  .catch(console.error);

  sound.listen(client,soundCommands,adminSoundCommands,stats);
  gifs.listen(client,gifCommands);
  misc.listen(client,sound,soundCommands,gifCommands);
  intro.listen(client,intros,exits,cooldown);
  stats.listen(client);
});

client.on('error', () => {
  console.log("destroy");
});

client.login(process.env.TOKEN);
