const Discord = require('discord.js');

//Modules
const tools = require('./lib/tools.js');
const sound = require('./lib/sound.js');
const gifs = require('./lib/gifs.js');
const intro = require('./lib/intro.js');
const stats = require('./lib/stats.js');
const { Users } = require('./db/dbObjects.js');

const gifCommands = require('./commands/gifcommands.json').commands;
const prefix = require('./config.json').prefix;

var soundCommands = [];
var adminSoundCommands = [];
var newSoundCommands = [];

const fs = require('fs');

class Client extends Discord.Client {

  constructor(...args) {
    super(...args);

    this.once("ready", () => {
      console.log('ready');
      client.user.setActivity(prefix + 'help for commands', { type: 'PLAYING' })
      .catch(console.error);

      sound.listen(this);
      gifs.listen(this);
      intro.listen(this);
      stats.listen(this);
    })
  }

  async init() {
    this.login(process.env.TOKEN);

    tools.loadSoundCommands(soundCommands,adminSoundCommands,newSoundCommands);
    tools.sort(soundCommands,gifCommands);

    client.on('message', message => {

      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if(!command) return;
      if(command.adminOnly && !message.member.hasPermission("ADMINISTRATOR")) return;

      try {
        command.execute(message, args, this);
      } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
      }

    });

  }

  getSoundCommands(){
    return soundCommands;
  }
  getAdminSoundCommands(){
    return adminSoundCommands;
  }
  getGifCommands(){
    return gifCommands;
  }
  getStats(){
    return stats;
  }
  getSound(){
    return sound;
  }
  getNewSoundCommands(){
    return newSoundCommands;
  }
  getPrefix(){
    return prefix;
  }
  getTools(){
    return tools;
  }
}

const client = new Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.init();
