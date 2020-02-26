module.exports = {
  name: 'clear',
  description: 'clear',
  adminOnly:true,
  async execute(message, args,client) {
    message.channel.messages.fetch(20).then(messages => {
      var messagesToDelete = new Array();
      messages.forEach(chatMessage => {
        if(chatMessage.content.charAt(0) == client.getPrefix()){
          messagesToDelete.push(chatMessage);
        }
        if(chatMessage.author.bot){
          messagesToDelete.push(chatMessage);
        }
      });
      message.channel.bulkDelete(messagesToDelete);
    });
  },
};
