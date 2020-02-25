const Discord = require('discord.js');

//Modules
const tools = require('./src/tools.js');
const sound = require('./src/sound.js');
const gifs = require('./src/gifs.js');
const misc = require('./src/misc.js');
const intro = require('./src/intro.js');
const stats = require('./src/stats.js');

const gifCommands = require('./commands/gifcommands.json').commands;
const prefix = require('./config.json').prefix;

var soundCommands = [];
var adminSoundCommands = [];
var newSoundCommands = [];

class Client extends Discord.Client {

  constructor(...args) {
    super(...args);

    this.once("ready", () => {
      console.log('ready');
      client.user.setActivity(prefix + 'help for commands', { type: 'PLAYING' })
      .catch(console.error);

      // sound.listen(this);
      gifs.listen(this);
      misc.listen(this);
      intro.listen(this);
      stats.listen(this);
    })
  }

  async init() {
    this.login(process.env.TOKEN);

    tools.loadSoundCommands(soundCommands,adminSoundCommands,newSoundCommands);
    tools.sort(soundCommands,gifCommands);
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
}

const client = new Client();
client.init();
