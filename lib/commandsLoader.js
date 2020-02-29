const Discord = require('discord.js');

module.exports = {
  loadCommands: async function(client){
    var gifCommands = await client.getDbHelper().getGifCommands();
    gifCommands.forEach((item, i) => {
      this.addGifCommand(client,item.dataValues.command,item.dataValues.link);
    });
  },
  addGifCommand: function(client,commandname,link){
    var command = {
      name: commandname,
      description: 'Post '+commandname+" gif",
      gif:true,
      guildOnly:true,
      execute(message, args,client) {
        message.channel.send(link);
      }
    };
    client.commands.set(commandname,command);
  }
};
