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
        count = result.length;
      });
      await leaderboard.push({id:user.user_id,messages:count});
    }
    return sortMessagesLeaderboard(leaderboard);
  },
  updateUserLastConnection: async function(id, lastConnection){
    var user = await Users.findOne({ where: { user_id: id } });
    if(user != null){
      user.lastConnection = lastConnection;
      user.save();
    }
    else{
      return Users.create({ user_id: id,lastConnection: lastConnection});
    }
  },
  addUserConnection: async function(id,connectTime,disconnectTime,connectionLength){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user)
    user = await Users.create({ user_id: id});
    var date = new Date();
    user.addConnection(id,user.lastConnection,date.getTime(),date.getTime()-user.lastConnection);
    this.updateUserLastConnection(id,0);
  },
  addUserSoundboard: async function(id,command){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user)
    user = await Users.create({ user_id: id});
    var date = new Date();
    user.addSoundboard(id,date.getTime(),command);
  },
  getUserConnections: async function(id){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user) return;
    var messages = await user.getConnections();
    var messagesNorm = new Array();

    messages.forEach((item, i) => {
      messagesNorm.push(item.dataValues);
    });

    return messagesNorm;
  },
  getUserConnectionMonthlyRank: async function(id){
    var rank = '#0';
    await this.getMonthlyUserConnectionsTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
        }
      });
    })
    return rank;
  },
  getUserConnectionAllTimeRank: async function(id){
    var rank = '#0';
    await this.getAllTimeUserConnectionsTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
        }
      });
    })
    return rank;
  },
  getUser: async function(id){
    var user = await Users.findOne({ where: { user_id: id } });
    return user;
  },
  getCurrentConnectionLength: async function(id){
    var user = await Users.findOne({ where: { user_id: id } });
    var date = new Date();
    if(user.lastConnection == 0) return 0;
    return date.getTime()-user.lastConnection;
  },
  getMonthlyUserConnectionsTotals: async function(){
    var users = await Users.findAll();
    var leaderboard = new Array();

    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();

    for(const user of users){
      var totalMs = 0;
      await this.getCurrentConnectionLength(user.user_id).then(function (result){
        totalMs += result;
      })
      await this.getUserConnections(user.user_id).then(function(result){
        result.forEach((item, i) => {
          disconnectDate = new Date(item.disconnectTime);
          if(currentMonth == disconnectDate.getMonth() && currentYear == disconnectDate.getYear()){
            totalMs+= item.connectionLength;
          }
        });
      });
      await leaderboard.push({id:user.user_id,totalTime:totalMs});
    }
    return sortConnectionsLeaderboard(leaderboard);
  },
  getAllTimeUserConnectionsTotals: async function(){
    var users = await Users.findAll();
    var leaderboard = new Array();

    for(const user of users){
      var totalMs = 0;
      await this.getCurrentConnectionLength(user.user_id).then(function (result){
        totalMs += result;
      })
      await this.getUserConnections(user.user_id).then(function(result){
        result.forEach((item, i) => {
          totalMs += item.connectionLength;
        });
      });
      await leaderboard.push({id:user.user_id,totalTime:totalMs});
    }
    return sortConnectionsLeaderboard(leaderboard);
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

function sortConnectionsLeaderboard(leaderboard){
  leaderboard.sort(function(a, b) {
    if (a.totalTime > b.totalTime) {
      return -1;
    }
    if (a.totalTime < b.totalTime) {
      return 1;
    }
    return 0;
  });
  return leaderboard;
}
