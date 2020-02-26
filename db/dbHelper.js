const { Users } = require('./dbObjects.js');
const Discord = require('discord.js');
const userSet = new Discord.Collection();

module.exports = {
  addUserMessage: async function (message){
    var user = await Users.findOne({ where: { user_id: message.author.id } });
    if(!user)
    user = await Users.create({ user_id: message.author.id});
    var date = new Date();
    user.addMessage(message.author.id,date.getTime());
  },
  getUserMessages: async function(id){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user) return;
    var messages = await user.getMessages();
    var messagesNorm = new Array();

    messages.forEach((item, i) => {
      messagesNorm.push(item.dataValues);
    });

    return messagesNorm;
  }
}
