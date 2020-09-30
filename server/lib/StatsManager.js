var client;

class StatsManager {
  constructor (discordClient) {
    client = discordClient;

    // listen for client join/disconnect
    client.on('voiceStateUpdate', (oldMember, newMember) => {
      let newUserChannel = newMember.channel;
      let oldUserChannel = oldMember.channel;
      let afkChannel = newMember.guild.afkChannel;

      // User joins server
      if (
        (oldUserChannel === null && newUserChannel !== null) ||
        (oldUserChannel === afkChannel && newUserChannel !== null)
      ) {
        if (newUserChannel !== afkChannel) {
          var date = new Date();
          var currentTime = date.getTime();
          client.dbHelper.updateUserLastConnection(newMember.id, currentTime);
        }
      } else if (newUserChannel === null || newUserChannel === afkChannel) {
        // User leaves server
        client.dbHelper.addUserConnection(newMember.id);
      }
    });

    // Listen for chat messages to be recorded as stats
    client.on('message', message => {
      if (!message.author.bot && message.content.charAt(0) !== client.prefix) {
        client.dbHelper.addUserMessage(message);
      }
    });

    client.on('guildMemberAdd', member => {
      client.dbHelper.addUser(member.id);
    });
  }

  addSoundBoardUse (id, command) {
    client.dbHelper.addUserSoundboard(id, command);
  }
}

module.exports = StatsManager;
