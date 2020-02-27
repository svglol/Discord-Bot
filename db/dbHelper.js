const { Users, UserSoundboard,UserMessage,UserConnection } = require('./dbObjects.js');
const Discord = require('discord.js');

var usersCache = new Array();
var userMessagesCache = new Array()
var userSoundboardCache = new Array();
var userConnectionCache = new Array();

module.exports = {
  sync:async function(client){
    await syncUserMessages();
    await syncUserConnections();
    await syncUserSoundboard();
    await syncUsers();
    client.getLogger().log('info', 'Synced Database to Cache')
  },
  addUserMessage: async function (message){
    var user = await Users.findOne({ where: { user_id: message.author.id } });
    if(!user)
    user = await Users.create({ user_id: message.author.id});
    var date = new Date();
    user.addMessage(message.author.id,date.getTime());
    syncUserMessages();
  },
  getUserMessages: async function(id){
    var messagesNorm = new Array();
    userMessagesCache.forEach((item, i) => {
      if(item.dataValues.user_id == id){
        messagesNorm.push(item.dataValues);
      }
    });
    return messagesNorm;
  },
  getUserMessageMonthlyRank: async function(id){
    var rank = 'N/A';
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
    var rank = 'N/A';
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
      if(count!=0){
        await leaderboard.push({id:user.user_id,messages:count});
      }
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
      if(count!=0){
        await leaderboard.push({id:user.user_id,messages:count});
      }
    }
    return sortMessagesLeaderboard(leaderboard);
  },
  updateUserLastConnection: async function(id, lastConnection){
    var user = await Users.findOne({ where: { user_id: id } });
    if(user != null){
      user.lastConnection = lastConnection;
      user.save();
      syncUsers();
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
    syncUserConnections();
  },
  addUserSoundboard: async function(id,command){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user)
    user = await Users.create({ user_id: id});
    var date = new Date();
    user.addSoundboard(id,date.getTime(),command);
    syncUserSoundboard();
  },
  getUserSoundboard: async function(id){
    var messagesNorm = new Array();
    userSoundboardCache.forEach((item, i) => {
      if(item.dataValues.user_id == id){
        messagesNorm.push(item.dataValues);
      }
    });
    return messagesNorm;
  },
  getUserConnections: async function(id){
    var messagesNorm = new Array();
    userConnectionsCache.forEach((item, i) => {
      if(item.dataValues.user_id == id){
        messagesNorm.push(item.dataValues);
      }
    });
    return messagesNorm;
  },
  getUserConnectionMonthlyRank: async function(id){
    var rank = 'N/A';
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
    var rank = 'N/A';
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
    var total = 0;
    usersCache.forEach((user, i) => {
      if(user.dataValues.user_id == id){
        if(user.dataValues.lastConnection == 0) return 0;
        var date = new Date();
        total = date.getTime()-user.dataValues.lastConnection;

      }
    });
    return total;
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
      if(totalMs!=0){
        await leaderboard.push({id:user.user_id,totalTime:totalMs});
      }
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
      if(totalMs!=0){
        await leaderboard.push({id:user.user_id,totalTime:totalMs});
      }
    }
    return sortConnectionsLeaderboard(leaderboard);
  },
  getAllTimeSoundboardTotals: async function(){
    var soundboardUsage = userSoundboardCache;
    var leaderboard = new Array();

    for(const userSoundboard of soundboardUsage){
      var update = leaderboard.find(data => data.command == userSoundboard.command);
      if(update != null){
        update.uses += 1;
      }
      else{
        leaderboard.push({command:userSoundboard.command,uses:1});
      }
    }
    return sortSoundboardUsageLeaderboard(leaderboard);
  },
  getMonthlySoundboardTotals: async function(){
    var soundboardUsage = userSoundboardCache;
    var leaderboard = new Array();

    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();

    for(const userSoundboard of soundboardUsage){
      useDate = new Date(userSoundboard.date);
      if(currentMonth == useDate.getMonth() && currentYear == useDate.getYear()){
        var update = leaderboard.find(data => data.command == userSoundboard.command);
        if(update != null){
          update.uses += 1;
        }
        else{
          leaderboard.push({command:userSoundboard.command,uses:1});
        }
      }
    }
    return sortSoundboardUsageLeaderboard(leaderboard);
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

function sortSoundboardUsageLeaderboard(leaderboard){
  leaderboard.sort(function(a, b) {
    if (a.uses > b.uses) {
      return -1;
    }
    if (a.uses < b.uses) {
      return 1;
    }
    return 0;
  });
  return leaderboard;
}

async function syncUserMessages(){
  var userMessages = await UserMessage.findAll();
  userMessagesCache = new Array();
  userMessages.forEach(i => userMessagesCache.push(i));
}

async function syncUserConnections(){
  var userConnections = await UserConnection.findAll();
  userConnectionsCache = new Array();
  userConnections.forEach(i => userConnectionsCache.push(i));
}

async function syncUsers(){
  var users = await Users.findAll();
  usersCache = new Array();
  users.forEach(i => usersCache.push(i));
}

async function syncUserSoundboard(){
  var userSoundboard = await UserSoundboard.findAll();
  userSoundboardCache = new Array();
  userSoundboard.forEach(i => userSoundboardCache.push(i));
}
