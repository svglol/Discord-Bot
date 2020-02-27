const { Users, UserSoundboard,UserMessage,UserConnection } = require('./dbObjects.js');
const Discord = require('discord.js');

var usersCollection = new Discord.Collection();
var userSoundboardCache = new Array();

module.exports = {
  sync:async function(client){

    await syncUsersCollection();
    await syncUserSoundboard();
    client.getLogger().log('info', 'Synced Database to Cache')
  },
  addUserMessage: async function (message){
    var user = await Users.findOne({ where: { user_id: message.author.id } });
    if(!user)
    user = await Users.create({ user_id: message.author.id});
    var date = new Date();
    user.addMessage(message.author.id,date.getTime());
    syncUsersCollection();
  },
  getUserMessages: async function(id){
    var messagesNorm = new Array();
    var user = usersCollection.get(id);
    if(user != null){
      messagesNorm.push(user.messages);
    }
    return messagesNorm;
  },
  getUserMessageMonthlyRank: async function(id){
    var rank = 'N/A';
    var messages = 0;
    await this.getMonthlyUserMessagesTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
          messages = item.messages;
        }
      });
    })
    return {rank:rank,messages:messages};
  },
  getUserMessageAllTimeRank: async function(id){
    var rank = 'N/A';
    var messages = 0;
    await this.getAllTimeUserMessagesTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
          messages = item.messages;
        }
      });
    })
    return {rank:rank,messages:messages};
  },
  getMonthlyUserMessagesTotals: async function(){
    var leaderboard = new Array();
    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();
    for (const [key, user] of usersCollection.entries()) {
      var count = 0;
      user.messages.forEach((message, i) => {
        var messageDate = new Date(message.date);
        if(currentMonth == messageDate.getMonth() && currentYear == messageDate.getYear()){
          count++;
        }
      });
      if(count!=0){
        leaderboard.push({id:user.user_id,messages:count});
      }
    }
    return sortMessagesLeaderboard(leaderboard);
  },
  getAllTimeUserMessagesTotals: async function(){
    var leaderboard = new Array();
    for (const [key, user] of usersCollection.entries()) {
      var count = 0;
      count = user.messages.length;
      if(count!=0){
        leaderboard.push({id:user.user_id,messages:count});
      }
    }
    return sortMessagesLeaderboard(leaderboard);
  },
  updateUserLastConnection: async function(id, lastConnection){
    var user = await Users.findOne({ where: { user_id: id } });
    if(user != null){
      user.lastConnection = lastConnection;
      await user.save();
      syncUsersCollection();
    }
    else{
      Users.create({ user_id: id,lastConnection: lastConnection});
    }
  },
  addUserConnection: async function(id,connectTime,disconnectTime,connectionLength){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user)
    user = await Users.create({ user_id: id});
    var date = new Date();
    await user.addConnection(id,user.lastConnection,date.getTime(),date.getTime()-user.lastConnection);
    await this.updateUserLastConnection(id,0);
    syncUsersCollection();
  },
  addUserSoundboard: async function(id,command){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user)
    user = await Users.create({ user_id: id});
    var date = new Date();
    await user.addSoundboard(id,date.getTime(),command);
    syncUserSoundboard();
    syncUsersCollection();
  },
  getUserSoundboard: async function(id){
    var messagesNorm = new Array();
    var user = usersCollection.get(id);
    if(user != null){
      messagesNorm.push(user.soundboard);
    }
    return messagesNorm;
  },
  getUserConnections: async function(id){
    var messagesNorm = new Array();
    var user = usersCollection.get(id);
    if(user != null){
      messagesNorm.push(user.connections);
    }
    return messagesNorm;
  },
  getUserConnectionMonthlyRank: async function(id){
    var rank = 'N/A';
    var time = '-';
    await this.getMonthlyUserConnectionsTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
          time = item.totalTime;
        }
      });
    })
    return {rank:rank,time:time};
  },
  getUserConnectionAllTimeRank: async function(id){
    var rank = 'N/A';
    var time = '-';
    await this.getAllTimeUserConnectionsTotals().then(async function (result){
      await result.forEach((item, i) => {
        if(item.id == id){
          rank =  "#"+(i+1);
          time = item.totalTime;
        }
      });
    })
    return {rank:rank,time:time};
  },
  getUser: async function(id){
    var user = await Users.findOne({ where: { user_id: id } });
    return user;
  },
  getCurrentConnectionLength: async function(id){
    var total = 0;
    var user = usersCollection.get(id)
    if(user != null){
      if(user.lastConnection == 0) return 0;
      var date = new Date();
      total = date.getTime()-user.lastConnection;
    }
    return total;
  },
  getMonthlyUserConnectionsTotals: async function(){
    var users = await Users.findAll();
    var leaderboard = new Array();

    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();


    for (const [key, user] of usersCollection.entries()) {
      var totalMs = 0;
      await this.getCurrentConnectionLength(user.user_id).then(function (result){
        totalMs += result;
      })
      user.connections.forEach((item, i) => {
        disconnectDate = new Date(item.disconnectTime);
        if(currentMonth == disconnectDate.getMonth() && currentYear == disconnectDate.getYear()){
          totalMs+= item.connectionLength;
        }
      });
      if(totalMs!=0){
        await leaderboard.push({id:user.user_id,totalTime:totalMs});
      }
    }
    return sortConnectionsLeaderboard(leaderboard);
  },
  getAllTimeUserConnectionsTotals: async function(){
    var leaderboard = new Array();

    for (const [key, user] of usersCollection.entries()) {
      var totalMs = 0;
      await this.getCurrentConnectionLength(user.user_id).then(function (result){
        totalMs += result;
      })
      user.connections.forEach((item, i) => {
        totalMs += item.connectionLength;
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
    console.log(leaderboard)
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

async function syncUserSoundboard(){
  var userSoundboard = await UserSoundboard.findAll();
  userSoundboardCache = new Array();
  userSoundboard.forEach(i => userSoundboardCache.push(i));
}

async function syncUsersCollection(){
  var users = await Users.findAll();
  usersCollection.clear();

  for(const user of users){
    var messages = await user.getMessages();
    var connections = await user.getConnections();
    var soundboard = await user.getSoundboards();

    var newUser = {user_id:user.dataValues.user_id,lastConnection:user.dataValues.lastConnection,messages:messages,connections:connections,soundboards:soundboard};
    usersCollection.set(user.dataValues.user_id,newUser);
  }
}
