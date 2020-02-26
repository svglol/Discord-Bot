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
  },
  getUserMessageMonthlyRank: async function(id){
    var rank = '#0';
    await this.getMonthlyUserMessagesTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
        }
      });
    })
    return rank;
  },
  getUserMessageAllTimeRank: async function(id){
    var rank = '#0';
    await this.getAllTimeUserMessagesTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
        }
      });
    })
    return rank;
  },
  getMonthlyUserMessagesTotals: async function(){
    var users = await Users.findAll();
    var leaderboard = new Array();

    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();

    for(const user of users){
      var count = 0;
      await this.getUserMessages(user.user_id).then(function(result){
        result.forEach((item, i) => {
          var messageDate = new Date(item.date);
          if(currentMonth == messageDate.getMonth() && currentYear == messageDate.getYear()){
            count++;
          }
        });
      });
      await leaderboard.push({id:user.user_id,messages:count});
    }
    return sortMessagesLeaderboard(leaderboard);
  },
  getAllTimeUserMessagesTotals: async function(){
    var users = await Users.findAll();
    var leaderboard = new Array();

    for(const user of users){
      var count = 0;
      await this.getUserMessages(user.user_id).then(function(result){
        result.forEach((item, i) => {
          count++;
        });
      });
      await leaderboard.push({id:user.user_id,messages:count});
    }
    return sortMessagesLeaderboard(leaderboard);
  },
  updateUserLastConnection: async function(id, lastConnection){
    var user = await Users.findOne({ where: { user_id: id } });
    user.lastConnection = lastConnection;
    user.save();
    if(!user)
    user = await Users.create({ user_id: message.author.id,lastConnection: lastConnection});
  }
}

function sortMessagesLeaderboard(leaderboard){
  leaderboard.sort(function(a, b) {
    if (a.messages > b.messages) {
      return -1;
    }
    if (a.messages < b.messages) {
      return 1;
    }
    return 0;
  });
  return leaderboard;
}
