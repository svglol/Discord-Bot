const fs = require("fs");
const Discord = require("discord.js");
const prefix = require("../config.json").prefix;
const tools = require('./tools.js');

var client;

module.exports = {
  listen: function(cClient) {
    client = cClient;

    //listen for client join/disconnect
    client.on("voiceStateUpdate", (oldMember, newMember) => {
      let newUserChannel = newMember.channel;
      let oldUserChannel = oldMember.channel;
      let afkChannel = newMember.guild.afkChannel;

      //User joins server
      if (
        (oldUserChannel === null && newUserChannel !== null) ||
        (oldUserChannel === afkChannel && newUserChannel !== null)
      ) {
        if (newUserChannel !== afkChannel) {
          var date = new Date();
          var currentTime = date.getTime();
          client.getDbHelper().updateUserLastConnection(newMember.id,currentTime);
        }
      }
      //User leaves server
      else if (newUserChannel === null || newUserChannel === afkChannel) {
        client.getDbHelper().addUserConnection(newMember.id);
      }
    });

    //Listen for chat messages to be recorded as stats
    client.on("message", message => {
      if(!message.author.bot && message.content.charAt(0) != prefix){
        client.getDbHelper().addUserMessage(message);
      }
    });

    client.on('guildMemberAdd', member => {
      client.getDbHelper().addUser(member.id);
    });

  },
  addSoundBoardUse: function(id,command){
    client.getDbHelper().addUserSoundboard(id,command);
  }
};
