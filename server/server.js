const Discord = require('discord.js');
const winston = require('winston');
var glob = require('glob');
require('dotenv').config();

// Modules
const tools = require('./lib/tools.js');
const sound = require('./lib/sound.js');
const intro = require('./lib/intro.js');
const stats = require('./lib/stats.js');
const commandsLoader = require('./lib/commandsLoader.js');

const dbHelper = require('./db/dbHelper.js');

const prefix = process.env.PREFIX;

const { Nuxt, Builder } = require('nuxt');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

const api = require('./api');

class Client extends Discord.Client {
  constructor (...args) {
    super(...args);

    this.once('ready', () => {
      client.user
        .setActivity(prefix + 'help for commands', {
          type: 'PLAYING'
        })
        .catch(console.error);

      sound.listen(this);
      intro.listen(this);
      stats.listen(this);
      api.init(client);

      // Import API Routes
      app.use('/api', api.router);

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
    });
  }

  async init () {
    this.login(process.env.TOKEN);

    client.on('ready', () => {
      dbHelper.syncGuildUsers(this);
    });

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
  getStats () {
    return stats;
  }
  getSound () {
    return sound;
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
  getPrefix () {
    return prefix;
  }
  getTools () {
    return tools;
  }
  getDbHelper () {
    return dbHelper;
  }
  getLogger () {
    return logger;
  }
  getCommandsLoader () {
    return commandsLoader;
  }
}

const client = new Client();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({'timestamp': true}),
    new winston.transports.File({
      filename: '.log',
      timestamp: true
    })
  ],
  format: winston.format.printf(
    log => `${log.level.toUpperCase()} - ${log.message}`
  )
});

client.commands = new Discord.Collection();

async function start () {
  client.init();
  await dbHelper.sync(client);
  await commandsLoader.loadCommands(client);
}

const commandFiles = glob.sync('server/commands' + '/**/*.js');

// generate commands from file
for (let file of commandFiles) {
  const command = require(`${file.replace('server/', './')}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => logger.log('info', 'Discord-Bot Connected'));
client.on('debug', m => logger.log('debug', m));
client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));

process.on('uncaughtException', error => logger.log('error', error));

start();

// Socket.io
var messages = [];
io.on('connection', (socket) => {
  socket.on('last-messages', function (fn) {
    fn(messages.slice(-50));
  });
  socket.on('send-message', function (message) {
    messages.push(message);
    socket.broadcast.emit('new-message', message);
  });
});
