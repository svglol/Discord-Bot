const {Users, UserSoundboard, UserMessage, UserConnection, GifCommands, SoundCommands} = require('./dbObjects.js');
const Discord = require('discord.js');

var usersCollection = new Discord.Collection();
var userSoundboardCache = [];

var dclient;

var dbInit = require('./dbInit.js');

class DbHelper {
  constructor (client) {
    dclient = client;
    dbInit.init(client);
    this.syncGuildUsers();
    syncUsersCollection();
    syncUserSoundboard();
    client.logger.log('info', 'Synced Database to Cache');
  }

  async addUser (id) {
    var user = await Users.findOne({ where: {user_id: id} });
    if (!user) {
      user = await Users.create({user_id: id});
      await syncUsersCollection();
    }
  }

  async addUserMessage (message) {
    var user = await Users.findOne({ where: { user_id: message.author.id } });
    if (!user) {
      user = await Users.create({user_id: message.author.id});
      await syncUsersCollection();
    }
    var date = new Date();
    var userMessage = await user.addMessage(message.author.id, date.getTime());
    var newMessage = {date: userMessage.dataValues.date};
    usersCollection.get(message.author.id).messages.push(newMessage);
  }

  async getUserMessages (id) {
    var messagesNorm = [];
    var user = usersCollection.get(id);
    if (user != null) {
      messagesNorm.push(user.messages);
    }
    return messagesNorm;
  }

  async syncGuildUsers () {
    for (const [key, guild] of dclient.guilds.cache.entries()) {
      for (const [id, member] of guild.members.cache.entries()) {
        await this.addUser(member.user.id);
      }
    }
  }

  async getUserMessageMonthlyRank (id) {
    var rank = 'N/A';
    var messages = 0;
    await this.getMonthlyUserMessagesTotals().then(async function (result) {
      await result.forEach((item, i) => {
        if (item.id === id) {
          rank = '#' + (i + 1);
          messages = item.messages;
        }
      });
    });
    return {rank: rank, messages: messages};
  }

  async getUserMessageAllTimeRank (id) {
    var rank = 'N/A';
    var messages = 0;
    await this.getAllTimeUserMessagesTotals().then(async function (result) {
      await result.forEach((item, i) => {
        if (item.id === id) {
          rank = '#' + (i + 1);
          messages = item.messages;
        }
      });
    });
    return {rank: rank, messages: messages};
  }

  async getMonthlyUserMessagesTotals () {
    var leaderboard = [];
    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();
    for (const [key, user] of usersCollection.entries()) {
      var count = 0;
      user.messages.forEach((message, i) => {
        var messageDate = new Date(message.date);
        if (currentMonth === messageDate.getMonth() && currentYear === messageDate.getYear()) {
          count++;
        }
      });
      if (count !== 0) {
        leaderboard.push({id: user.user_id, messages: count});
      }
    }
    return sortMessagesLeaderboard(leaderboard);
  }

  async getAllTimeUserMessagesTotals () {
    var leaderboard = [];
    for (const [key, user] of usersCollection.entries()) {
      var count = 0;
      count = user.messages.length;
      if (count !== 0) {
        leaderboard.push({id: user.user_id, messages: count});
      }
    }
    return sortMessagesLeaderboard(leaderboard);
  }

  async updateUserLastConnection (id, lastConnection) {
    var user = await Users.findOne({ where: { user_id: id } });
    usersCollection.get(id).lastConnection = lastConnection;
    if (user != null) {
      user.lastConnection = lastConnection;
      await user.save();
    } else {
      await Users.create({user_id: id, lastConnection: lastConnection});
      syncUsersCollection();
    }
  }

  async addUserConnection (id) {
    var user = await Users.findOne({ where: { user_id: id } });
    if (!user) {
      user = await Users.create({user_id: id});
    }
    var date = new Date();
    var lastConnection = usersCollection.get(id).lastConnection;
    this.updateUserLastConnection(id, 0);
    if (lastConnection !== 0) {
      var userConnection = await user.addConnection(id, lastConnection, date.getTime(), date.getTime() - lastConnection);
      var newConnection = {
        connectTime: userConnection.dataValues.connectTime,
        disconnectTime: userConnection.dataValues.disconnectTime,
        connectionLength: userConnection.dataValues.connectionLength};
      usersCollection.get(id).connections.push(newConnection);
    }
  }

  async addUserSoundboard (id, command) {
    var user = await Users.findOne({ where: { user_id: id } });
    if (!user) {
      user = await Users.create({user_id: id});
      syncUsersCollection();
    }
    var date = new Date();
    var userSoundboard = await user.addSoundboard(id, date.getTime(), command);
    var newSoundboard = {
      date: userSoundboard.dataValues.date,
      command: userSoundboard.dataValues.command};
    usersCollection.get(id).soundboards.push(newSoundboard);
    syncUserSoundboard();
  }

  async getUserSoundboard (id) {
    var messagesNorm = [];
    var user = usersCollection.get(id);
    if (user != null) {
      messagesNorm.push(user.soundboard);
    }
    return messagesNorm;
  }

  async getUserConnections (id) {
    var messagesNorm = [];
    var user = usersCollection.get(id);
    if (user != null) {
      messagesNorm.push(user.connections);
    }
    return messagesNorm;
  }

  async getUserConnectionMonthlyRank (id) {
    var rank = 'N/A';
    var time = '-';
    await this.getMonthlyUserConnectionsTotals().then(async function (result) {
      await result.forEach((item, i) => {
        if (item.id === id) {
          rank = '#' + (i + 1);
          time = item.totalTime;
        }
      });
    });
    return {rank: rank, time: time};
  }

  async getUserConnectionAllTimeRank (id) {
    var rank = 'N/A';
    var time = '-';
    await this.getAllTimeUserConnectionsTotals().then(async function (result) {
      await result.forEach((item, i) => {
        if (item.id === id) {
          rank = '#' + (i + 1);
          time = item.totalTime;
        }
      });
    });
    return {rank: rank, time: time};
  }

  async getUser (id) {
    var user = await Users.findOne({ where: { user_id: id } });
    return user;
  }

  async getCurrentConnectionLength (id) {
    var total = 0;
    var user = usersCollection.get(id);
    if (user != null) {
      if (user.lastConnection === 0) return 0;
      var date = new Date();
      total = date.getTime() - user.lastConnection;
    }
    return total;
  }

  async getMonthlyUserConnectionsTotals () {
    var leaderboard = [];

    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();

    for (const [key, user] of usersCollection.entries()) {
      var totalMs = 0;
      await this.getCurrentConnectionLength(user.user_id).then(function (result) {
        totalMs += result;
      });
      user.connections.forEach((item, i) => {
        var disconnectDate = new Date(item.disconnectTime);
        if (currentMonth === disconnectDate.getMonth() && currentYear === disconnectDate.getYear()) {
          totalMs += item.connectionLength;
        }
      });
      if (totalMs !== 0) {
        await leaderboard.push({id: user.user_id, totalTime: totalMs});
      }
    }
    return sortConnectionsLeaderboard(leaderboard);
  }

  async getAllTimeUserConnectionsTotals () {
    var leaderboard = [];

    for (const [key, user] of usersCollection.entries()) {
      var totalMs = 0;
      await this.getCurrentConnectionLength(user.user_id).then(function (result) {
        totalMs += result;
      });
      user.connections.forEach((item, i) => {
        totalMs += item.connectionLength;
      });
      if (totalMs !== 0) {
        await leaderboard.push({id: user.user_id, totalTime: totalMs});
      }
    }
    return sortConnectionsLeaderboard(leaderboard);
  }

  async getAllTimeSoundboardTotals () {
    var soundboardUsage = userSoundboardCache;
    var leaderboard = [];
    for (const userSoundboard of soundboardUsage) {
      var update = leaderboard.find(data => data.command === userSoundboard.command);
      if (update != null) {
        update.uses += 1;
      } else {
        leaderboard.push({command: userSoundboard.command, uses: 1});
      }
    }
    return sortSoundboardUsageLeaderboard(leaderboard);
  }

  async getMonthlySoundboardTotals () {
    var soundboardUsage = userSoundboardCache;
    var leaderboard = [];

    var date = new Date();
    var currentMonth = date.getMonth();
    var currentYear = date.getYear();

    for (const userSoundboard of soundboardUsage) {
      var useDate = new Date(userSoundboard.date);
      if (currentMonth === useDate.getMonth() && currentYear === useDate.getYear()) {
        var update = leaderboard.find(data => data.command === userSoundboard.command);
        if (update != null) {
          update.uses += 1;
        } else {
          leaderboard.push({command: userSoundboard.command, uses: 1});
        }
      }
    }
    return sortSoundboardUsageLeaderboard(leaderboard);
  }

  async setSoundCommandVolume (command, volume) {
    var soundCommand = await SoundCommands.findOne({ where: {command: command} });
    if (soundCommand) {
      soundCommand.volume = volume;
      soundCommand.save();
    }
  }

  async addGifCommand (command, link, date) {
    var gifCommand = await GifCommands.findOne({ where: {command: command} });
    if (!gifCommand) {
      gifCommand = await GifCommands.create({command: command, link: link, date: date});
    }
    return gifCommand;
  }

  async getGifCommands () {
    return GifCommands.findAll();
  }

  getUsers () {
    return usersCollection;
  }

  async addUserIntro (id, link) {
    var user = await Users.findOne({ where: { user_id: id } });
    if (user != null) {
      user.intro = link;
      await user.save();
    }
    usersCollection.get(id).intro = link;
  }

  async addUserExit (id, link) {
    var user = await Users.findOne({ where: { user_id: id } });
    if (user != null) {
      user.exit = link;
      await user.save();
    }
    usersCollection.get(id).exit = link;
  }

  async getSoundCommands () {
    return SoundCommands.findAll();
  }

  async addSoundCommand (command, file, volume, date) {
    var soundCommand = await SoundCommands.findOne({ where: {command: command} });
    if (!soundCommand) {
      soundCommand = await SoundCommands.create({command: command, file: file, volume: volume, date: date});
    }
    return soundCommand;
  }

  async deleteSoundCommand (command) {
    var soundCommand = await SoundCommands.findOne({ where: {command: command} });
    await soundCommand.destroy();
  }

  async deleteGifCommand (command) {
    var gifCommand = await GifCommands.findOne({ where: {command: command} });
    await gifCommand.destroy();
  }

  async editGifCommand (id, command, link) {
    var gifCommand = await GifCommands.findOne({ where: {id: id} });
    gifCommand.command = command;
    gifCommand.link = link;
    gifCommand.save();
  }

  async editSoundCommand (id, command, file, volume) {
    var soundCommand = await SoundCommands.findOne({ where: {id: id} });
    soundCommand.command = command;
    soundCommand.volume = volume;
    soundCommand.file = file;
    soundCommand.save();
  }
}

function sortMessagesLeaderboard (leaderboard) {
  leaderboard.sort(function (a, b) {
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

function sortConnectionsLeaderboard (leaderboard) {
  leaderboard.sort(function (a, b) {
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

function sortSoundboardUsageLeaderboard (leaderboard) {
  leaderboard.sort(function (a, b) {
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

async function syncUserSoundboard () {
  var userSoundboard = await UserSoundboard.findAll();
  userSoundboardCache = [];
  userSoundboard.forEach(i => userSoundboardCache.push(i));
}

async function syncUsersCollection () {
  let users = await Users.findAll();
  usersCollection.clear();

  for (const user of users) {
    var messages = await user.getMessages();
    var connections = await user.getConnections();
    var soundboard = await user.getSoundboards();
    var newMessages = [];
    messages.forEach((item, i) => {
      var newMessage = {date: item.dataValues.date};
      newMessages.push(newMessage);
    });

    var newConnections = [];
    connections.forEach((item, i) => {
      var newConnection = {
        connectTime: item.dataValues.connectTime,
        disconnectTime: item.dataValues.disconnectTime,
        connectionLength: item.dataValues.connectionLength};
      newConnections.push(newConnection);
    });

    var newSoundboards = [];
    soundboard.forEach((item, i) => {
      var newSoundboard = {
        date: item.dataValues.date,
        command: item.dataValues.command};
      newSoundboards.push(newSoundboard);
    });
    var username = '';
    let duser = await dclient.users.fetch(user.dataValues.user_id);
    if (duser !== undefined) {
      username = duser.username;
    }

    var newUser = {user_id: user.dataValues.user_id, lastConnection: user.dataValues.lastConnection, messages: newMessages, connections: newConnections, soundboards: newSoundboards, intro: user.dataValues.intro, exit: user.dataValues.exit, username: username};
    usersCollection.set(user.dataValues.user_id, newUser);
  }
}

module.exports = DbHelper;
