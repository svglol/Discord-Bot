const Discord = require('discord.js');
const winston = require('winston');
var glob = require("glob")

//Modules
const tools = require('./lib/tools.js');
const sound = require('./lib/sound.js');
const intro = require('./lib/intro.js');
const stats = require('./lib/stats.js');
const commandsLoader = require('./lib/commandsLoader.js');

const dbHelper = require('./db/dbHelper.js');

const prefix = require('./config.json').prefix;

const fs = require('fs');

class Client extends Discord.Client {

  constructor(...args) {
    super(...args);

    this.once("ready", () => {
      client.user.setActivity(prefix + 'help for commands', { type: 'PLAYING' })
      .catch(console.error);

      sound.listen(this);
      intro.listen(this);
      stats.listen(this);
    })
  }

  async init() {
    this.login(process.env.TOKEN);

    client.on('ready', () => {
      dbHelper.syncGuildUsers(this);
    });

    client.on('message', message => {

      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if(!command) return;
      if (command.guildOnly && message.channel.type !== 'text') return message.reply('I can\'t execute that command inside DMs!');
      if(command.adminOnly && !message.member.hasPermission("ADMINISTRATOR")) return;
      if(command.meOnly && message.author.id != '80282793766035456') return;
      if (command.args && !args.length || command.args && args.length != command.numArgs) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
          reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
      }

      try {
        command.execute(message, args, this);
      } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
      }

    });
  }

  getSoundCommands(){
    return Array.from(client.commands.filter(function (command){
      if(typeof command.soundboard !== 'undefined')return true;
      return false;
    }));
  }
  getGifCommands(){
    return Array.from(client.commands.filter(function (command){
      if(typeof command.gif !== 'undefined')return true;
      return false;
    }));
  }
  getStats(){
    return stats;
  }
  getSound(){
    return sound;
  }
  getNewSoundCommands(){
    return Array.from(client.commands.filter(function (command){
      if(typeof command.newSound !== 'undefined'){
        if(command.newSound == true)return true;
        else return false;
      }
      return false;
    }));
  }
  getPrefix(){
    return prefix;
  }
  getTools(){
    return tools;
  }
  getDbHelper(){
    return dbHelper;
  }
  getLogger(){
    return logger;
  }
  getCommandsLoader(){
    return commandsLoader;
  }
}

const client = new Client();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log' }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

client.commands = new Discord.Collection();

async function start(){
  await dbHelper.sync(client);
  await commandsLoader.loadCommands(client);
  client.init();
}


const commandFiles = glob.sync('./commands' + '/**/*.js');

//generate commands from file
for (const file of commandFiles) {
  const command = require(`${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => logger.log('info', 'Discord-Bot Connected'));
client.on('debug', m => logger.log('debug', m));
client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));

process.on('uncaughtException', error => logger.log('error', error));

start();
