const Discord = require('discord.js');
const winston = require('winston');
const { format, createLogger, transports } = require('winston');
const ArrayTransport = require('winston-array-transport');
require('dotenv').config();

// Modules
const SoundManager = require('./lib/SoundManager');
const StatsManager = require('./lib/StatsManager');
const IntroExitManager = require('./lib/IntroExitManager');
const Tools = require('./lib/Tools.js');
const CommandsLoader = require('./lib/CommandsLoader.js');
const DbHelper = require('./db/dbHelper.js');
const Api = require('./api');

// Nuxt / Api
const { Nuxt, Builder } = require('nuxt');
const app = require('express')();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

var log = [];
const prefix = process.env.PREFIX;

class Client extends Discord.Client {
  constructor (...args) {
    super(...args);

    this.logger = logger;
    this.startTime = new Date().getTime();
    this.prefix = prefix;
    this.login(process.env.TOKEN);

    this.on('ready', () => logger.log('info', 'Discord-Bot Connected'));
    this.on('debug', m => logger.log('debug', m));
    this.on('warn', m => logger.log('warn', m));
    this.on('error', m => logger.log('error', m));

    process.on('uncaughtException', error => this.logger.log('error', error));

    this.once('ready', () => {
      this.commands = new Discord.Collection();
      this.dbHelper = new DbHelper(this);
      this.stats = new StatsManager(this);
      this.soundManager = new SoundManager(this);
      this.intro = new IntroExitManager(this);
      this.tools = new Tools();
      this.commandsLoader = new CommandsLoader(this);
      this.expressApi = new Api(this);

      // Import API Routes
      app.use('/api', this.expressApi.router);

      // We instantiate Nuxt.js with the options
      var config = require('../nuxt.config.js');
      config.dev = !isProd;

      const nuxt = new Nuxt(config);
      // Start build process in dev mode
      if (config.dev) {
        const builder = new Builder(nuxt);
        builder.build();
      }
      app.use(nuxt.render);

      // Listen the server
      server.listen(port, '0.0.0.0');
      logger.log('info', 'Server listening on localhost:' + port);

      // Set Activitiy
      client.user
        .setActivity(prefix + 'help for commands', {
          type: 'PLAYING'
        })
        .catch(console.error);

      // Listen for commands
      client.on('message', message => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command =
      client.commands.get(commandName) ||
      client.commands.find(
        cmd => cmd.aliases && cmd.aliases.includes(commandName)
      );

        if (!command) return;
        if (command.guildOnly && message.channel.type !== 'text') { return message.reply("I can't execute that command inside DMs!"); }
        if (command.adminOnly && message.channel.type !== 'text') { return message.reply("I can't execute that command inside DMs!"); }
        if (command.adminOnly && !message.member.hasPermission('ADMINISTRATOR')) { return; }
        if (command.meOnly && message.author.id !== '80282793766035456') return;
        if (
          (command.args && !args.length) ||
        (command.args && args.length !== command.numArgs)
        ) {
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
    });
  }

  getSoundCommands () {
    return Array.from(
      client.commands.filter(function (command) {
        if (typeof command.soundboard !== 'undefined') return true;
        return false;
      })
    );
  }
  getGifCommands () {
    return Array.from(
      client.commands.filter(function (command) {
        if (typeof command.gif !== 'undefined') return true;
        return false;
      })
    );
  }
  getNewSoundCommands () {
    return Array.from(
      client.commands.filter(function (command) {
        if (typeof command.newSound !== 'undefined') {
          if (command.newSound === true) return true;
          else return false;
        }
        return false;
      })
    );
  }
  getLog () {
    return log;
  }
}

// Winston logging
// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.Console({'timestamp': true}),
//     new winston.transports.File({
//       filename: '.log',
//       timestamp: true
//     }),
//     new ArrayTransport({ array: log })
//   ],
//   format: winston.format.printf(
//     log => `${log.timestamp} - ${log.level.toUpperCase()} - ${log.message}`
//   )
// });

const logger = createLogger({
  format: format.combine(
    format.label({ label: '[my-label]' }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '.log'
    }),
    new ArrayTransport({ array: log })
  ]
});

// Load discord client
const client = new Client();
