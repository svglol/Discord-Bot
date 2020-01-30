const prefix = require('../config.json').prefix;

module.exports = {
  listen:function(client){
    const gifCommands = client.getGifCommands();

    client.on('message', message => {
      if(message.content.charAt(0) == prefix){
        var msg = message.content.substring(1);
        gifCommands.forEach(obj => {
          if(msg == obj.command){
            message.channel.send(obj.link);
          }
        });
      }
    });
  }
};
