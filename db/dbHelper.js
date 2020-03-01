const { Users, UserSoundboard,UserMessage,UserConnection,CommandVolume,GifCommands} = require('./dbObjects.js');
const Discord = require('discord.js');

const dbInit =  require('./dbInit.js');

var usersCollection = new Discord.Collection();
var commandVolumeCache = new Discord.Collection();
var userSoundboardCache = new Array();

module.exports = {
  sync:async function(client){
    await dbInit.init(client);
    await syncCommandVolumeCache();
    await syncUsersCollection();
    await syncUserSoundboard();
    client.getLogger().log('info', 'Synced Database to Cache')
  },
  addUser: async function (id){
    var user = await Users.findOne({ where: { user_id: id} });
    if(!user){
      user = await Users.create({ user_id: id});
    }
  },
  addUserMessage: async function (message){
    var user = await Users.findOne({ where: { user_id: message.author.id } });
    if(!user){
      user = await Users.create({ user_id: message.author.id});
      await syncUsersCollection();
    }
    var date = new Date();
    var userMessage = await user.addMessage(message.author.id,date.getTime());
    usersCollection.get(message.author.id).messages.push(userMessage);
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
    usersCollection.get(id).lastConnection = lastConnection;
    if(user != null){
      user.lastConnection = lastConnection;
      await user.save();
    }
    else{
      await Users.create({ user_id: id,lastConnection: lastConnection});
      syncUsersCollection();
    }
  },
  addUserConnection: async function(id){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user){
      user = await Users.create({ user_id: id});
    }
    var date = new Date();
    var lastConnection = usersCollection.get(id).lastConnection;
    this.updateUserLastConnection(id,0);
    if(lastConnection != 0){
      var userConnection = await user.addConnection(id,lastConnection,date.getTime(),date.getTime()-lastConnection);
      usersCollection.get(id).connections.push(userConnection);
    }
  },
  addUserSoundboard: async function(id,command){
    var user = await Users.findOne({ where: { user_id: id } });
    if(!user){
      user = await Users.create({ user_id: id});
      syncUsersCollection();
    }
    var date = new Date();
    var userSoundboard = await user.addSoundboard(id,date.getTime(),command);
    usersCollection.get(id).soundboards.push(userSoundboard);
    syncUserSoundboard();
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
  },
  syncGuildUsers: async function(client){
    for (const [key, guild] of client.guilds.cache.entries()) {
      for (const [id, member] of guild.members.cache.entries()) {
        await this.addUser(member.user.id);
      }
    }
    await syncUsersCollection();
  },
  addCommandVolume:async function(command,volume){
    var commandVolume = await CommandVolume.findOne({ where: { command: command} });
    if(!commandVolume){
      commandVolume = await CommandVolume.create({ command: command,volume:volume});
    }
    else{
      commandVolume.volume = volume;
      commandVolume.save();
    }
    commandVolumeCache.set(command,volume);
  },
  getCommandVolume:function(command){
    if(!commandVolumeCache.get(command)) return 1;
    return commandVolumeCache.get(command);
  },
  addGifCommand:async function(command,link,date){
    var gifCommand = await GifCommands.findOne({ where: { command: command} });
    if(!gifCommand){
      gifCommand = await GifCommands.create({ command: command,link:link,date:date});
    }
  },
  getGifCommands: async function(){
    return await GifCommands.findAll();
  },
  getUsers:function(){
    return usersCollection;
  },
  addUserIntro:async function(id,link){
    var user = await Users.findOne({ where: { user_id: id } });
    if(user != null){
      user.intro = link;
      await user.save();
    }
    usersCollection.get(id).intro = link;
  },
  addUserExit:async function(id,link){
    var user = await Users.findOne({ where: { user_id: id } });
    if(user != null){
      user.exit = link;
      await user.save();
    }
    usersCollection.get(id).intro = link;
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

    var newUser = {user_id:user.dataValues.user_id,lastConnection:user.dataValues.lastConnection,messages:messages,connections:connections,soundboards:soundboard,intro:user.dataValues.intro,exit:user.dataValues.exit};
    usersCollection.set(user.dataValues.user_id,newUser);
  }
}

async function syncCommandVolumeCache(){
  var soundboardVolumes = await CommandVolume.findAll();
  commandVolumeCache.clear();
  soundboardVolumes.forEach(i => commandVolumeCache.set(i.dataValues.command,i.dataValues.volume));
}
